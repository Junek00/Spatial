import {
  Globe,
  Zap,
  HelpCircle,
  CheckSquare,
  Lightbulb,
  Link,
  Quote,
  BookOpen,
  MessageCircle,
  Sparkles,
  ScrollText,
  Scale,
  FileText,
  type LucideIcon,
} from "lucide-react"

export type ContentType =
  | "entity"
  | "claim"
  | "question"
  | "task"
  | "idea"
  | "reference"
  | "quote"
  | "definition"
  | "opinion"
  | "reflection"
  | "narrative"
  | "comparison"
  | "thesis"
  | "general"

export interface ContentTypeConfig {
  label: string
  shortBadge: string
  icon: LucideIcon
  accentVar: string
  bodyStyle?: "blockquote" | "italic" | "checkbox" | "confidence" | "muted-italic"
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  entity: {
    label: "Entity",
    shortBadge: "ENT",
    icon: Globe,
    accentVar: "var(--type-entity)",
  },
  claim: {
    label: "Claim",
    shortBadge: "CLM",
    icon: Zap,
    accentVar: "var(--type-claim)",
    bodyStyle: "confidence",
  },
  question: {
    label: "Question",
    shortBadge: "Q?",
    icon: HelpCircle,
    accentVar: "var(--type-question)",
  },
  task: {
    label: "Task",
    shortBadge: "TASK",
    icon: CheckSquare,
    accentVar: "var(--type-task)",
    bodyStyle: "checkbox",
  },
  idea: {
    label: "Idea",
    shortBadge: "IDEA",
    icon: Lightbulb,
    accentVar: "var(--type-idea)",
  },
  reference: {
    label: "Reference",
    shortBadge: "REF",
    icon: Link,
    accentVar: "var(--type-reference)",
  },
  quote: {
    label: "Quote",
    shortBadge: "QUO",
    icon: Quote,
    accentVar: "var(--type-quote)",
    bodyStyle: "blockquote",
  },
  definition: {
    label: "Definition",
    shortBadge: "DEF",
    icon: BookOpen,
    accentVar: "var(--type-definition)",
    bodyStyle: "blockquote",
  },
  opinion: {
    label: "Opinion",
    shortBadge: "OPN",
    icon: MessageCircle,
    accentVar: "var(--type-opinion)",
    bodyStyle: "italic",
  },
  reflection: {
    label: "Reflection",
    shortBadge: "RFL",
    icon: Sparkles,
    accentVar: "var(--type-reflection)",
    bodyStyle: "muted-italic",
  },
  narrative: {
    label: "Narrative",
    shortBadge: "NAR",
    icon: ScrollText,
    accentVar: "var(--type-narrative)",
  },
  comparison: {
    label: "Comparison",
    shortBadge: "CMP",
    icon: Scale,
    accentVar: "var(--type-comparison)",
  },
  general: {
    label: "Note",
    shortBadge: "NOTE",
    icon: FileText,
    accentVar: "var(--type-general)",
  },
  thesis: {
    label: "Thesis",
    shortBadge: "THX",
    icon: Sparkles,
    accentVar: "var(--thesis-accent)", // Unique accent for synthesized thesis
  },
}

export const ALL_CONTENT_TYPES = Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]
