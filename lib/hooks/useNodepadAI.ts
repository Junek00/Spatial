import { useCallback, useRef } from 'react'
import { useStore } from '@/lib/store'
import type { TextBlock, Project } from '@/lib/types'
import { enrichBlockClient } from '@/lib/ai-enrich'
import { generateGhostClient } from '@/lib/ai-ghost'

export function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

function buildGhostContext(enrichedBlocks: TextBlock[]) {
  if (enrichedBlocks.length <= 8) return enrichedBlocks

  const sorted = [...enrichedBlocks].sort((a, b) => b.timestamp - a.timestamp)
  const selected = new Set<string>()
  const result: TextBlock[] = []

  sorted.slice(0, 4).forEach(b => { selected.add(b.id); result.push(b) })

  const representedCats = new Set(result.map(b => b.category))
  const byCat = new Map<string, TextBlock>()
  sorted.forEach(b => {
    if (b.category && !byCat.has(b.category)) byCat.set(b.category, b)
  })
  for (const [cat, block] of byCat) {
    if (result.length >= 10) break
    if (!representedCats.has(cat) && !selected.has(block.id)) {
      selected.add(block.id)
      result.push(block)
      representedCats.add(cat)
    }
  }

  for (const b of sorted) {
    if (result.length >= 10) break
    if (!selected.has(b.id)) { selected.add(b.id); result.push(b) }
  }

  return result
}

export function useNodepadAI() {
  const { setProjects } = useStore()
  const generatingRef = useRef<Set<string>>(new Set())

  const generateGhostNote = useCallback(async (projectId: string) => {
    const state = useStore.getState()
    const targetProject = state.projects.find(p => p.id === projectId)
    if (!targetProject) return

    const enrichedBlocks = targetProject.blocks.filter(b => !b.isEnriching && b.category)
    if (enrichedBlocks.length < 5) return
    if ((targetProject.ghostNotes || []).length >= 5) return
    if (generatingRef.current.has(projectId)) return

    const lastCount = targetProject.lastGhostBlockCount || 0
    if (enrichedBlocks.length < lastCount + 5) return

    const lastTime = targetProject.lastGhostTimestamp || 0
    const fiveMinutes = 5 * 60 * 1000
    if (Date.now() - lastTime < fiveMinutes) return

    const categories = new Set(enrichedBlocks.map(b => b.category).filter(Boolean))
    if (categories.size < 2) return

    generatingRef.current.add(projectId)
    const ghostId = "ghost-" + generateId()

    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      ghostNotes: [...(p.ghostNotes || []), { id: ghostId, text: "", category: "thesis", isGenerating: true }],
      lastGhostBlockCount: enrichedBlocks.length,
      lastGhostTimestamp: Date.now()
    } : p))

    try {
      const curated = buildGhostContext(enrichedBlocks)
      const context = curated.map(b => ({
        text: b.text,
        category: b.category,
        contentType: b.contentType,
      }))

      const previousSyntheses = (targetProject.lastGhostTexts || []).slice(-5)
      const data = await generateGhostClient(context, previousSyntheses)
      
      setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p
        return {
          ...p,
          ghostNotes: (p.ghostNotes || []).map(n =>
            n.id === ghostId ? { ...n, text: data.text, category: data.category, isGenerating: false } : n
          ),
          lastGhostTexts: [...(p.lastGhostTexts || []), data.text].slice(-10),
        }
      }))
    } catch (e) {
      console.error("Ghost note generation failed", e)
      setProjects(prev => prev.map(p => p.id === projectId
        ? { ...p, ghostNotes: (p.ghostNotes || []).filter(n => n.id !== ghostId) }
        : p
      ))
    } finally {
      generatingRef.current.delete(projectId)
    }
  }, [setProjects])

  const enrichBlock = useCallback(async (projectId: string, id: string, text: string, category?: string, forcedType?: string) => {
    setProjects(prevProjects => {
      const targetProject = prevProjects.find(p => p.id === projectId)
      if (!targetProject) return prevProjects

      const context = targetProject.blocks
        .filter((b) => b.id !== id && !b.isEnriching)
        .map((b) => ({
          id: b.id,
          text: b.text,
          category: b.category,
          annotation: b.annotation,
        }))
        .slice(-15)

      const performEnrich = async () => {
        try {
          const data = await enrichBlockClient(
            text,
            context.map(({ id, ...rest }) => ({ id, ...rest })),
            forcedType,
            category,
          )

          const influencedBy = data.influencedByIndices
              ? (data.influencedByIndices as number[])
                  .map((idx) => context[idx]?.id)
                  .filter(Boolean) as string[]
              : []

            setProjects((current: Project[]) => {
              const mergeTargetIdx = data.mergeWithIndex
              const mergeTargetId = mergeTargetIdx !== null && mergeTargetIdx !== undefined && context[mergeTargetIdx] ? context[mergeTargetIdx].id : null

              return current.map(proj => {
                if (proj.id !== projectId) return proj

                if (mergeTargetId) {
                  return {
                    ...proj,
                    blocks: proj.blocks
                      .filter(b => b.id !== id)
                      .map(b => b.id === mergeTargetId ? {
                        ...b,
                        text: b.text + "\n\n" + text,
                        contentType: data.contentType,
                        category: data.category,
                        annotation: data.annotation,
                        confidence: data.confidence,
                        influencedBy,
                        isUnrelated: data.isUnrelated,
                        sources: data.sources ?? undefined,
                        isEnriching: false,
                        statusText: undefined,
                        isError: false,
                      } : b)
                  }
                }
                if (data.contentType === "task") {
                  const existingTaskIndex = proj.blocks.findIndex(b => b.contentType === "task" && b.id !== id)
                  if (existingTaskIndex !== -1) {
                    const existingTask = proj.blocks[existingTaskIndex]
                    const isDuplicate = existingTask.subTasks?.some(
                      (st: any) => st.text.trim() === text.trim()
                    )
                    if (isDuplicate) {
                      return { ...proj, blocks: proj.blocks.filter(b => b.id !== id) }
                    }
                    const newSubTask = {
                      id: Math.random().toString(36).substring(2, 9),
                      text: text,
                      isDone: false,
                      timestamp: Date.now()
                    }

                    return {
                      ...proj,
                      blocks: proj.blocks
                        .filter(b => b.id !== id)
                        .map(b => b.id === existingTask.id ? {
                          ...b,
                          subTasks: [...(b.subTasks || []), newSubTask],
                          isEnriching: false,
                          statusText: undefined
                        } : b)
                    }
                  } else {
                    return {
                      ...proj,
                      blocks: proj.blocks.map(b => b.id === id ? {
                        ...b,
                        contentType: "task",
                        category: "Tasks",
                        subTasks: [{
                          id: Math.random().toString(36).substring(2, 9),
                          text: text,
                          isDone: false,
                          timestamp: Date.now()
                        }],
                        isEnriching: false,
                        statusText: undefined,
                        isError: false
                      } : b)
                    }
                  }
                }

                return {
                  ...proj,
                  blocks: proj.blocks.map(b => b.id === id ? {
                    ...b,
                    contentType: data.contentType,
                    category: data.category,
                    annotation: data.annotation,
                    confidence: data.confidence,
                    influencedBy,
                    isUnrelated: data.isUnrelated,
                    sources: data.sources ?? undefined,
                    isEnriching: false,
                    statusText: undefined,
                    isError: false,
                  } : b)
                }
              })
            })

            setTimeout(() => generateGhostNote(projectId), 2500)
        } catch (e: any) {
          console.error(e)
          const msg = e?.message ?? ""
          const isNoKey = msg.includes("No API key")
          const isRateLimit = msg.includes("429") || msg.toLowerCase().includes("rate limit")
          const isNetwork = msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")
          const isServerErr = /\b50[023]\b/.test(msg)
          const isJsonErr = msg.includes("invalid JSON") || msg.includes("JSON")
          const statusText = isNoKey ? "no-api-key"
            : isRateLimit ? "rate-limit"
            : isNetwork ? "network-error"
            : isServerErr ? "server-error"
            : isJsonErr ? "json-error"
            : msg ? `error: ${msg.slice(0, 120)}` : undefined
          setProjects((current: Project[]) => current.map(proj => proj.id === projectId ? {
            ...proj,
            blocks: proj.blocks.map(b => b.id === id ? { ...b, isEnriching: false, isError: true, statusText } : b)
          } : proj))
        }
      }

      performEnrich()

      return prevProjects.map(p => p.id === projectId ? {
        ...p,
        blocks: p.blocks.map(b => b.id === id ? { ...b, isEnriching: true, isError: false } : b)
      } : p)
    })
  }, [generateGhostNote, setProjects])

  return { generateGhostNote, enrichBlock }
}
