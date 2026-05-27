"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TilingArea } from "@/components/tiling-area"
import { KanbanArea } from "@/components/kanban-area"
import { GraphArea } from "@/components/graph-area"
import { ProjectSidebar } from "@/components/project-sidebar"
import { StatusBar } from "@/components/status-bar"
import { GhostPanel } from "@/components/ghost-panel"
import { VimInput } from "@/components/vim-input"
import { IntroModal } from "@/components/intro-modal"
import type { ContentType } from "@/lib/content-types"
import { useAISettings } from "@/lib/ai-settings"
import { exportToMarkdown, downloadMarkdown, copyToClipboard } from "@/lib/export"
import { downloadNodepadFile, parseNodepadFile, NodepadParseError } from "@/lib/nodepad-format"
import { detectContentType } from "@/lib/detect-content-type"
import { TileIndex } from "@/components/tile-index"
import { useStore } from "@/lib/store"
import { useUndo } from "@/lib/hooks/useUndo"
import { useNodepadAI, generateId } from "@/lib/hooks/useNodepadAI"
import { useTranslation } from "@/lib/i18n"

export default function Page() {
  const { 
    projects, activeProjectId, setActiveProjectId, 
    updateActiveProject, addProject, deleteProject, renameProject, pushHistory
  } = useStore()
  
  const { undo, undoToast } = useUndo()
  const { generateGhostNote, enrichBlock } = useNodepadAI()

  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isIndexOpen, setIsIndexOpen] = useState(false)
  const [isGhostPanelOpen, setIsGhostPanelOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"tiling" | "kanban" | "graph">("tiling")
  const [isCommandKOpen, setIsCommandKOpen] = useState(false)
  const [jumpToSettings, setJumpToSettings] = useState(false)
  const [isIntroOpen, setIsIntroOpen] = useState(false)
  const [showHelpTooltip, setShowHelpTooltip] = useState(false)
  
  const helpTooltipTimer = useRef<NodeJS.Timeout | null>(null)
  const { updateSettings, currentModel } = useAISettings()
  const settings = useStore(state => state.aiSettings)
  const debounceTimers = useRef<Record<string, Record<string, NodeJS.Timeout>>>({})
  const importInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    setIsLoaded(true)
    if (!localStorage.getItem("nodepad-intro-seen")) {
      setIsIntroOpen(true)
    }
  }, [])

  const activeProject = useMemo(() =>
    projects.find(p => p.id === activeProjectId) || projects[0],
  [projects, activeProjectId])

  const blocks = activeProject?.blocks || []
  const ghostNotes = activeProject?.ghostNotes || []

  // Clear debounce timers for previous project
  const prevActiveProjectId = useRef<string | null>(null)
  useEffect(() => {
    const prev = prevActiveProjectId.current
    if (prev && prev !== activeProjectId && debounceTimers.current[prev]) {
      Object.values(debounceTimers.current[prev]).forEach(clearTimeout)
      delete debounceTimers.current[prev]
    }
    prevActiveProjectId.current = activeProjectId
  }, [activeProjectId])

  const handleIntroClose = useCallback(() => {
    setIsIntroOpen(false)
    localStorage.setItem("nodepad-intro-seen", "true")
    setShowHelpTooltip(true)
    if (helpTooltipTimer.current) clearTimeout(helpTooltipTimer.current)
    // @ts-ignore
    helpTooltipTimer.current = setTimeout(() => setShowHelpTooltip(false), 6000)
  }, [])

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const names = projects.map(p => p.name)
        const imported = parseNodepadFile(raw, names) as any
        addProject(imported)
        setIsSidebarOpen(false)
      } catch (err) {
        if (err instanceof NodepadParseError) {
          alert(err.message)
        } else {
          alert("Could not import file — make sure it's a valid .nodepad file.")
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }, [projects, addProject])

  const claimGhostNote = useCallback((id: string) => {
    const note = ghostNotes.find(n => n.id === id)
    if (!note || note.isGenerating) return
    const newId = generateId()
    const { text, category } = note

    updateActiveProject(p => ({
      ...p,
      blocks: [...p.blocks, {
        id: newId,
        text,
        timestamp: Date.now(),
        contentType: "thesis" as ContentType,
        category,
        isEnriching: true
      }],
      ghostNotes: (p.ghostNotes || []).filter(n => n.id !== id),
    }))
    enrichBlock(activeProjectId, newId, text, category, "thesis")
  }, [ghostNotes, activeProjectId, updateActiveProject, enrichBlock])

  const dismissGhostNote = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      ghostNotes: (p.ghostNotes || []).filter(n => n.id !== id),
    }))
  }, [updateActiveProject])

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandKOpen(prev => !prev)
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault()
          undo()
        }
      }
      if (e.key === "Escape") {
        if (isCommandKOpen) setIsCommandKOpen(false)
        else if (isGhostPanelOpen) setIsGhostPanelOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeys)
    return () => window.removeEventListener("keydown", handleKeys)
  }, [isCommandKOpen, isGhostPanelOpen, undo])

  const addBlock = useCallback(
    (text: string, forcedType?: ContentType) => {
      let resolvedText = text
      let resolvedType = forcedType

      if (!resolvedType) {
        const tagMatch = text.match(/^#([a-z]+)\s+(.+)/i)
        if (tagMatch) {
          const tag = tagMatch[1].toLowerCase() as ContentType
          const ALL_TYPES: ContentType[] = [
            "entity", "claim", "question", "task", "idea", "reference",
            "quote", "definition", "opinion", "reflection", "narrative",
            "comparison", "thesis", "general"
          ]
          if (ALL_TYPES.includes(tag)) {
            resolvedType = tag
            resolvedText = tagMatch[2].trim()
          }
        }
      }

      const newId = generateId()
      const heuristicType = resolvedType ?? detectContentType(resolvedText)
      const HIGH_CONFIDENCE_TYPES = new Set<ContentType>(["question", "reference", "quote", "task"])
      const enrichForcedType = resolvedType ?? (HIGH_CONFIDENCE_TYPES.has(heuristicType) ? heuristicType : undefined)
      const initialDisplayType: ContentType = resolvedType ?? (HIGH_CONFIDENCE_TYPES.has(heuristicType) ? heuristicType : "general")

      pushHistory(activeProjectId, useStore.getState().projects.find(p => p.id === activeProjectId)?.blocks || [])
      updateActiveProject(p => ({
        ...p,
        blocks: [...p.blocks, {
          id: newId,
          text: resolvedText,
          timestamp: Date.now(),
          contentType: initialDisplayType,
          isEnriching: true,
        }]
      }))

      setIsCommandKOpen(false)
      enrichBlock(activeProjectId, newId, resolvedText, undefined, enrichForcedType).catch(console.error)
    },
    [activeProjectId, pushHistory, updateActiveProject, enrichBlock]
  )

  const deleteBlock = useCallback((id: string) => {
    pushHistory(activeProjectId, useStore.getState().projects.find(p => p.id === activeProjectId)?.blocks || [])
    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.filter(b => b.id !== id)
    }))
  }, [activeProjectId, pushHistory, updateActiveProject])

  const editBlock = useCallback((id: string, newText: string) => {
    const currentBlocks = useStore.getState().projects.find(p => p.id === activeProjectId)?.blocks || []
    const currentBlock = currentBlocks.find(b => b.id === id)
    
    if (currentBlock && currentBlock.text !== newText) {
      pushHistory(activeProjectId, currentBlocks)
    }

    if (!debounceTimers.current[activeProjectId]) debounceTimers.current[activeProjectId] = {}
    if (debounceTimers.current[activeProjectId][id]) clearTimeout(debounceTimers.current[activeProjectId][id])

    updateActiveProject(p => {
      const block = p.blocks.find(b => b.id === id)
      if (!block || block.text === newText) return p
      
      debounceTimers.current[activeProjectId][id] = setTimeout(() => {
        enrichBlock(activeProjectId, id, newText, block.category).catch(console.error)
        delete debounceTimers.current[activeProjectId][id]
      }, 800) as any

      return {
        ...p,
        blocks: p.blocks.map(b => b.id === id ? { ...b, text: newText, isEnriching: true, isError: false } : b)
      }
    })
  }, [activeProjectId, pushHistory, updateActiveProject, enrichBlock])

  const reEnrichBlock = useCallback((id: string, newCategory?: string) => {
    const currentBlocks = useStore.getState().projects.find(p => p.id === activeProjectId)?.blocks || []
    const block = currentBlocks.find(b => b.id === id)
    if (!block) return

    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === id ? { ...b, category: newCategory, isEnriching: true } : b)
    }))

    enrichBlock(activeProjectId, id, block.text, newCategory || block.category, block.contentType).catch(console.error)
  }, [activeProjectId, updateActiveProject, enrichBlock])

  const editAnnotation = useCallback((id: string, newAnnotation: string) => {
    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === id ? { ...b, annotation: newAnnotation } : b)
    }))
  }, [updateActiveProject])

  const toggleCollapse = useCallback((id: string) => {
    updateActiveProject(p => {
      const next = new Set(p.collapsedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...p, collapsedIds: [...next] }
    })
  }, [updateActiveProject])

  const handleTogglePin = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b)
    }))
  }, [updateActiveProject])

  const handleToggleSubTask = useCallback((blockId: string, subTaskId: string) => {
    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === blockId ? {
        ...b,
        subTasks: b.subTasks?.map((st: any) => st.id === subTaskId ? { ...st, isDone: !st.isDone } : st)
      } : b)
    }))
  }, [updateActiveProject])

  const handleDeleteSubTask = useCallback((blockId: string, subTaskId: string) => {
    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === blockId ? {
        ...b,
        subTasks: b.subTasks?.filter((st: any) => st.id !== subTaskId)
      } : b)
    }))
  }, [updateActiveProject])

  const handleChangeType = useCallback((id: string, newType: ContentType) => {
    const currentBlocks = useStore.getState().projects.find(p => p.id === activeProjectId)?.blocks || []
    const block = currentBlocks.find(b => b.id === id)
    if (!block) return
    pushHistory(activeProjectId, currentBlocks)
    updateActiveProject(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === id ? { ...b, contentType: newType, isEnriching: true } : b)
    }))
    enrichBlock(activeProjectId, id, block.text, block.category, newType).catch(console.error)
  }, [activeProjectId, pushHistory, updateActiveProject, enrichBlock])

  const clearBlocks = useCallback(() => {
    pushHistory(activeProjectId, useStore.getState().projects.find(p => p.id === activeProjectId)?.blocks || [])
    updateActiveProject(p => ({ ...p, blocks: [], collapsedIds: [] }))
  }, [activeProjectId, pushHistory, updateActiveProject])

  const createProject = useCallback(() => {
    addProject({
      id: generateId(),
      name: "New Space",
      blocks: [],
      collapsedIds: [],
      ghostNotes: [],
    })
  }, [addProject])

  const handleCommand = useCallback((cmd: string, text?: string) => {
    setIsCommandKOpen(false)
    
    if (cmd === "kanban") setViewMode("kanban")
    else if (cmd === "tiling") setViewMode("tiling")
    else if (cmd === "graph") setViewMode("graph")
    else if (cmd === "open-projects") {
      setIsGhostPanelOpen(false); setIsIndexOpen(false); setIsSidebarOpen(prev => !prev)
    } else if (cmd === "new-project") {
      setIsGhostPanelOpen(false); setIsIndexOpen(false); setIsSidebarOpen(true); createProject()
    } else if (cmd === "open-index") {
      setIsSidebarOpen(false); setIsGhostPanelOpen(false); setIsIndexOpen(prev => !prev)
    } else if (cmd === "open-synthesis") {
      setIsSidebarOpen(false); setIsIndexOpen(false); setIsGhostPanelOpen(prev => !prev)
    } else if (cmd === "clear") clearBlocks()
    else if (cmd === "help") window.open("https://github.com/albingroen/react-cmdk", "_blank")
    else if (cmd === "export-nodepad") {
      if (activeProject) downloadNodepadFile(activeProject)
    } else if (cmd === "import-nodepad") {
      importInputRef.current?.click()
    }
    else if (cmd === "export-md") {
      if (activeProject) {
        const md = exportToMarkdown(activeProject.name, activeProject.blocks)
        const slug = activeProject.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        downloadMarkdown(`${slug}.md`, md)
      }
    } else if (cmd === "copy-md") {
      if (activeProject) {
        const md = exportToMarkdown(activeProject.name, activeProject.blocks)
        copyToClipboard(md)
      }
    }
    else if (cmd === "task" && text) addBlock(text, "task")
    else if (cmd === "thesis" && text) addBlock(text, "thesis")
    
  }, [activeProject, clearBlocks, addBlock, createProject])

  if (!isLoaded) return <div className="h-dvh w-dvw bg-background" />

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <input
        ref={importInputRef}
        type="file"
        accept=".nodepad,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={createProject}
        onRenameProject={renameProject}
        onDeleteProject={deleteProject}
        onImportProject={() => importInputRef.current?.click()}
        aiSettings={settings}
        onUpdateAISettings={updateSettings}
        openToSettings={jumpToSettings}
        onSettingsOpened={() => setJumpToSettings(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <StatusBar
          blockCount={blocks.length}
          blocks={blocks}
          isSidebarOpen={isSidebarOpen}
          isIndexOpen={isIndexOpen}
          isGhostPanelOpen={isGhostPanelOpen}
          ghostNoteCount={ghostNotes.filter(n => !n.isGenerating).length}
          activeProjectName={activeProject?.name || ""}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onIndexToggle={() => setIsIndexOpen(!isIndexOpen)}
          onGhostPanelToggle={() => setIsGhostPanelOpen(prev => !prev)}
          modelLabel={settings.apiKey ? currentModel.shortLabel : undefined}
          showHelpTooltip={showHelpTooltip}
          onHelpTooltipDismiss={() => {
            setShowHelpTooltip(false)
            if (helpTooltipTimer.current) clearTimeout(helpTooltipTimer.current)
          }}
        />

        {!settings.apiKey && (
          <div className="flex items-center justify-center gap-3 px-4 py-2 bg-amber-950/80 border-b border-amber-800/60 text-amber-200 text-xs shrink-0">
            <span className="opacity-80">{t("aiInactiveMessage")}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setIsSidebarOpen(true); setJumpToSettings(true) }}
                className="px-2.5 py-1 rounded bg-amber-700/60 hover:bg-amber-600/70 text-amber-100 font-medium transition-colors cursor-pointer border border-amber-600/50"
              >
                {t("addApiKeyBtn")}
              </button>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-90 transition-opacity underline underline-offset-2"
              >
                {t("getApiKeyBtn")}
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden relative">
          <main className="relative flex-1 overflow-hidden">
            {viewMode === "tiling" ? (
              <TilingArea
                key={`tiling-${activeProjectId}`}
                blocks={blocks}
                collapsedIds={new Set(activeProject.collapsedIds)}
                onDelete={deleteBlock}
                onEdit={editBlock}
                onEditAnnotation={editAnnotation}
                onReEnrich={reEnrichBlock}
                onChangeType={handleChangeType}
                onToggleCollapse={toggleCollapse}
                onTogglePin={handleTogglePin}
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
                highlightedBlockId={highlightedBlockId}
                onHighlight={setHighlightedBlockId}
              />
            ) : viewMode === "kanban" ? (
              <KanbanArea
                key={`kanban-${activeProjectId}`}
                blocks={blocks}
                onDelete={deleteBlock}
                onEdit={editBlock}
                onEditAnnotation={editAnnotation}
                onReEnrich={reEnrichBlock}
                onChangeType={handleChangeType}
                onToggleCollapse={toggleCollapse}
                onTogglePin={handleTogglePin}
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
                collapsedIds={new Set(activeProject.collapsedIds)}
              />
            ) : (
              <GraphArea
                key={`graph-${activeProjectId}`}
                blocks={blocks}
                ghostNote={ghostNotes[ghostNotes.length - 1]}
                projectName={activeProject.name}
                onReEnrich={reEnrichBlock}
                onChangeType={handleChangeType}
                onTogglePin={handleTogglePin}
                onEdit={editBlock}
                onEditAnnotation={editAnnotation}
                highlightedBlockId={highlightedBlockId}
                onHighlight={setHighlightedBlockId}
              />
            )}
          </main>

          <GhostPanel
            ghostNotes={ghostNotes}
            isOpen={isGhostPanelOpen}
            onClose={() => setIsGhostPanelOpen(false)}
            onClaim={claimGhostNote}
            onDismiss={dismissGhostNote}
          />
        </div>

        {/* Undo toast */}
        <AnimatePresence>
          {undoToast && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-[130] pointer-events-none"
            >
              <div className="px-3 py-1.5 rounded-md bg-popover border border-border backdrop-blur-md shadow-xl">
                <span className="font-mono text-xs text-foreground/70 tracking-tight whitespace-nowrap">{undoToast}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <VimInput
          onSubmit={addBlock}
          onCommand={handleCommand}
          onUndo={undo}
          isCommandKOpen={isCommandKOpen}
          setIsCommandKOpen={setIsCommandKOpen}
        />
      </div>

      <TileIndex 
        blocks={blocks} 
        onHighlight={setHighlightedBlockId} 
        highlightedId={highlightedBlockId}
        onClose={() => setIsIndexOpen(false)}
        isOpen={isIndexOpen}
        viewMode={viewMode}
      />

      <IntroModal open={isIntroOpen} onClose={handleIntroClose} />
    </div>
  )
}
