import type { TextBlock } from "@/components/tile-card"
export type { TextBlock }

export interface GhostNote {
  id: string
  text: string
  category?: string
  isGenerating?: boolean
}

export interface Project {
  id: string
  name: string
  blocks: TextBlock[]
  collapsedIds: string[]
  ghostNotes: GhostNote[]
  lastGhostBlockCount?: number
  lastGhostTimestamp?: number
  lastGhostTexts?: string[]
}
