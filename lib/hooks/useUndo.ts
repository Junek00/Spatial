import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'

export function useUndo() {
  const { activeProjectId, popHistory, updateActiveProject } = useStore()
  const [undoToast, setUndoToast] = useState<string | null>(null)
  const undoToastTimer = useRef<NodeJS.Timeout | null>(null)

  const showUndoToast = useCallback((msg: string) => {
    if (undoToastTimer.current) clearTimeout(undoToastTimer.current)
    setUndoToast(msg)
    // @ts-ignore
    undoToastTimer.current = setTimeout(() => setUndoToast(null), 2200)
  }, [])

  useEffect(() => () => {
    if (undoToastTimer.current) clearTimeout(undoToastTimer.current)
  }, [])

  const undo = useCallback(() => {
    const previousBlocks = popHistory(activeProjectId)
    if (!previousBlocks) {
      showUndoToast("Nothing to undo")
      return
    }
    updateActiveProject(p => ({ ...p, blocks: previousBlocks }))
    showUndoToast("↩ Undone")
  }, [activeProjectId, popHistory, updateActiveProject, showUndoToast])

  return { undo, undoToast }
}
