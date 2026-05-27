import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_PROJECTS } from './initial-data'
import type { Project, GhostNote } from './types'
import type { TextBlock } from '@/components/tile-card'

interface NodepadState {
  projects: Project[]
  activeProjectId: string
  language: 'ko' | 'en'
  setLanguage: (lang: 'ko' | 'en') => void
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void
  setActiveProjectId: (id: string) => void
  updateActiveProject: (updater: (p: Project) => Project) => void
  addProject: (project: Project) => void
  deleteProject: (id: string) => void
  renameProject: (id: string, name: string) => void
  moveBlockToProject: (blockId: string, fromProjectId: string, toProjectId: string) => void
  copyBlockToProject: (blockId: string, fromProjectId: string, toProjectId: string) => void
  pushHistory: (projectId: string, blocks: TextBlock[]) => void
  popHistory: (projectId: string) => TextBlock[] | null
  blockHistory: Record<string, TextBlock[][]>
}

export const useStore = create<NodepadState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      activeProjectId: INITIAL_PROJECTS[0]?.id || "",
      blockHistory: {},
      language: 'ko',

      setLanguage: (lang) => set({ language: lang }),

      setProjects: (projectsOrUpdater) => set((state) => ({
        projects: typeof projectsOrUpdater === 'function' ? projectsOrUpdater(state.projects) : projectsOrUpdater
      })),
      
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      
      updateActiveProject: (updater) => set((state) => ({
        projects: state.projects.map((p) => p.id === state.activeProjectId ? updater(p) : p)
      })),
      
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project],
        activeProjectId: project.id
      })),
      
      deleteProject: (id) => set((state) => {
        const nextProjects = state.projects.filter((p) => p.id !== id)
        if (nextProjects.length === 0) return state
        return {
          projects: nextProjects,
          activeProjectId: state.activeProjectId === id ? nextProjects[0].id : state.activeProjectId
        }
      }),
      
      renameProject: (id, name) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, name } : p)
      })),

      moveBlockToProject: (blockId, fromProjectId, toProjectId) => set((state) => {
        if (fromProjectId === toProjectId) return state
        
        let blockToMove = null
        const fromProject = state.projects.find(p => p.id === fromProjectId)
        if (fromProject) {
          blockToMove = fromProject.blocks.find(b => b.id === blockId)
        }
        if (!blockToMove) return state

        return {
          projects: state.projects.map(p => {
            if (p.id === fromProjectId) {
              return { ...p, blocks: p.blocks.filter(b => b.id !== blockId) }
            }
            if (p.id === toProjectId) {
              return { ...p, blocks: [...p.blocks, blockToMove] }
            }
            return p
          })
        }
      }),

      copyBlockToProject: (blockId, fromProjectId, toProjectId) => set((state) => {
        let blockToCopy = null
        const fromProject = state.projects.find(p => p.id === fromProjectId)
        if (fromProject) {
          blockToCopy = fromProject.blocks.find(b => b.id === blockId)
        }
        if (!blockToCopy) return state

        const newBlock = { ...blockToCopy, id: crypto.randomUUID() }

        return {
          projects: state.projects.map(p => {
            if (p.id === toProjectId) {
              return { ...p, blocks: [...p.blocks, newBlock] }
            }
            return p
          })
        }
      }),

      pushHistory: (projectId, blocks) => set((state) => {
        const history = state.blockHistory[projectId] || []
        const newHistory = [...history, blocks.map(b => ({ ...b }))]
        if (newHistory.length > 20) newHistory.shift()
        return {
          blockHistory: {
            ...state.blockHistory,
            [projectId]: newHistory
          }
        }
      }),

      popHistory: (projectId) => {
        const state = get()
        const history = state.blockHistory[projectId]
        if (!history || history.length === 0) return null
        
        const newHistory = [...history]
        const previousBlocks = newHistory.pop()!
        
        set({
          blockHistory: {
            ...state.blockHistory,
            [projectId]: newHistory
          }
        })
        
        return previousBlocks
      }
    }),
    {
      name: 'nodepad-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        language: state.language
      })
    }
  )
)
