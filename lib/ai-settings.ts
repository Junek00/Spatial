"use client"

import { useState, useEffect, useCallback } from "react"

export interface AIModel {
  id: string
  label: string
  shortLabel: string
  description: string
  supportsGrounding: boolean
  /** For OpenAI models: the search-preview variant to use when grounding is enabled */
  groundingModelId?: string
}

export type AIProvider = "openrouter" | "openai" | "gemini" | "claude" | "inception"

export interface AIProviderPreset {
  id: AIProvider
  label: string
  baseUrl: string
  keyUrl: string
  keyPlaceholder: string
}

export const AI_PROVIDER_PRESETS: AIProviderPreset[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    keyUrl: "https://openrouter.ai/settings/keys",
    keyPlaceholder: "sk-or-v1-...",
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyPlaceholder: "AIza...",
  },
  {
    id: "claude",
    label: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-...",
  },
  {
    id: "inception",
    label: "Inception Mercury",
    baseUrl: "https://api.inceptionlabs.ai/v1",
    keyUrl: "https://platform.inceptionlabs.ai/dashboard/api-keys",
    keyPlaceholder: "sk-b38c...",
  },
]

export function getPreset(provider: AIProvider): AIProviderPreset {
  return AI_PROVIDER_PRESETS.find(p => p.id === provider) || AI_PROVIDER_PRESETS[0]
}

export const AI_MODELS: AIModel[] = [
  {
    id: "anthropic/claude-sonnet-4-5",
    label: "Claude Sonnet 4.5",
    shortLabel: "Claude",
    description: "Best reasoning & annotation quality",
    supportsGrounding: false,
  },
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    shortLabel: "GPT-4o",
    description: "Strong structured output, broad knowledge",
    supportsGrounding: true,
  },
  {
    id: "google/gemini-2.5-pro-preview-03-25",
    label: "Gemini 2.5 Pro",
    shortLabel: "Gemini",
    description: "Long-context, web grounding available",
    supportsGrounding: true,
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek V3",
    shortLabel: "DeepSeek",
    description: "Cost-efficient frontier model",
    supportsGrounding: false,
  },
  {
    id: "mistralai/mistral-small-3.2-24b-instruct",
    label: "Mistral Small 3.2",
    shortLabel: "Mistral",
    description: "Fast, excellent structured outputs",
    supportsGrounding: false,
  },
  // ── 무료 모델 ────────────────────────────────────────────────────────────────
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B (무료)",
    shortLabel: "Gemma 4",
    description: "Google — 무료, 멀티모달 지원",
    supportsGrounding: false,
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron 3 Super 120B (무료)",
    shortLabel: "Nemotron",
    description: "NVIDIA — 무료, 120B 대형 모델",
    supportsGrounding: false,
  },
  {
    id: "minimax/minimax-m2.5:free",
    label: "MiniMax M2.5 (무료)",
    shortLabel: "MiniMax",
    description: "MiniMax — 무료",
    supportsGrounding: false,
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    label: "Nemotron 3 Nano 30B (무료)",
    shortLabel: "Nemotron Nano",
    description: "NVIDIA — 무료, 경량 빠른 모델",
    supportsGrounding: false,
  },
]

export const OPENAI_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o",
    shortLabel: "GPT-4o",
    description: "Strong structured output, broad knowledge",
    supportsGrounding: true,
    groundingModelId: "gpt-4o-search-preview",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    shortLabel: "GPT-4o Mini",
    description: "Fast and capable, web grounding available",
    supportsGrounding: true,
    groundingModelId: "gpt-4o-mini-search-preview",
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    shortLabel: "GPT-4.1",
    description: "Latest GPT-4, improved instruction following",
    supportsGrounding: false,
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    shortLabel: "GPT-4.1 Mini",
    description: "Fast and capable, good balance",
    supportsGrounding: false,
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    shortLabel: "o4-mini",
    description: "Fast reasoning model",
    supportsGrounding: false,
  },
]

export const GEMINI_MODELS: AIModel[] = [
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    shortLabel: "Gemini 2.5 Flash",
    description: "Best price-performance, low latency",
    supportsGrounding: false,
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    shortLabel: "Gemini 2.5 Pro",
    description: "Most advanced, deep reasoning",
    supportsGrounding: false,
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    shortLabel: "Flash Lite",
    description: "Fastest and most budget-friendly",
    supportsGrounding: false,
  },
]

export const CLAUDE_MODELS: AIModel[] = [
  {
    id: "claude-sonnet-4-5",
    label: "Claude Sonnet 4.5",
    shortLabel: "Sonnet 4.5",
    description: "Best reasoning & annotation quality",
    supportsGrounding: false,
  },
  {
    id: "claude-opus-4-5",
    label: "Claude Opus 4.5",
    shortLabel: "Opus 4.5",
    description: "Most capable Claude model",
    supportsGrounding: false,
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    shortLabel: "Haiku 4.5",
    description: "Fast and lightweight",
    supportsGrounding: false,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    label: "Claude 3.5 Sonnet",
    shortLabel: "Sonnet 3.5",
    description: "Reliable, broad knowledge",
    supportsGrounding: false,
  },
]

export const INCEPTION_MODELS: AIModel[] = [
  {
    id: "mercury-2",
    label: "Mercury 2",
    shortLabel: "Mercury 2",
    description: "Inception Labs — 무료 10M 토큰",
    supportsGrounding: false,
  },
]

export function getModelsForProvider(provider: AIProvider): AIModel[] {
  if (provider === "openai") return OPENAI_MODELS
  if (provider === "gemini") return GEMINI_MODELS
  if (provider === "claude") return CLAUDE_MODELS
  if (provider === "inception") return INCEPTION_MODELS
  return AI_MODELS // openrouter + safe fallback for any stale localStorage value
}

export const DEFAULT_MODEL_ID = "openai/gpt-4o"
export const DEFAULT_PROVIDER: AIProvider = "openrouter"

// ── Dynamic model fetching ────────────────────────────────────────────────────

export interface FetchedModel {
  id: string
  name?: string
  description?: string
  owned_by?: string
  isFree?: boolean
  contextLength?: number
}

export async function fetchModelsFromProvider(
  provider: AIProvider,
  apiKey: string,
  customBaseUrl?: string,
): Promise<FetchedModel[]> {
  // If provider is inception, they might not support /models or we just want to return Mercury
  if (provider === "inception") {
    return [{
      id: "mercury-2",
      name: "Mercury 2",
      description: "Inception Labs — 무료 10M 토큰 (디퓨전 기반 超고속 모델)",
      isFree: true
    }]
  }

  const baseUrl = customBaseUrl?.trim() || getPreset(provider).baseUrl
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
  }
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://nodepad.space"
    headers["X-Title"] = "nodepad"
  }
  const res = await fetch(`${baseUrl}/models`, { headers })
  if (!res.ok) throw new Error(`Failed to fetch models (${res.status})`)
  const data = await res.json()
  const items: Array<{
    id: string
    name?: string
    description?: string
    owned_by?: string
    pricing?: { prompt?: string; completion?: string }
    context_length?: number
  }> = data?.data ?? []
  return items.map(m => {
    const isFree = m.pricing
      ? (m.pricing.prompt === "0" || m.pricing.prompt === "0.0") &&
        (m.pricing.completion === "0" || m.pricing.completion === "0.0")
      : false
    return {
      id: m.id,
      name: m.name,
      description: m.description,
      owned_by: m.owned_by,
      isFree,
      contextLength: m.context_length,
    }
  })
}

export interface AISettings {
  apiKey: string
  modelId: string
  webGrounding: boolean
  provider: AIProvider
  customBaseUrl: string
  /** Per-provider key store so switching back to a provider restores its key */
  providerKeys?: Partial<Record<AIProvider, string>>
}

const STORAGE_KEY = "nodepad-ai-settings"

function loadSettings(): AISettings {
  if (typeof window === "undefined") {
    return { apiKey: "", modelId: DEFAULT_MODEL_ID, webGrounding: false, provider: DEFAULT_PROVIDER, customBaseUrl: "" }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { apiKey: "", modelId: DEFAULT_MODEL_ID, webGrounding: false, provider: DEFAULT_PROVIDER, customBaseUrl: "" }
    return { apiKey: "", modelId: DEFAULT_MODEL_ID, webGrounding: false, provider: DEFAULT_PROVIDER, customBaseUrl: "", ...JSON.parse(raw) }
  } catch {
    return { apiKey: "", modelId: DEFAULT_MODEL_ID, webGrounding: false, provider: DEFAULT_PROVIDER, customBaseUrl: "" }
  }
}

export interface AIConfig {
  apiKey: string
  modelId: string
  supportsGrounding: boolean
  provider: AIProvider
  customBaseUrl: string
}

export function loadAIConfig(): AIConfig | null {
  const s = loadSettings()
  if (!s.apiKey) return null
  const models = getModelsForProvider(s.provider)
  const model = models.find(m => m.id === s.modelId)
  const modelId = model?.id ?? models[0]?.id ?? s.modelId ?? DEFAULT_MODEL_ID
  const supportsGrounding =
    (s.provider === "openrouter" || s.provider === "openai") &&
    s.webGrounding &&
    (model?.supportsGrounding ?? false)
  return { apiKey: s.apiKey, modelId, supportsGrounding, provider: s.provider, customBaseUrl: s.customBaseUrl }
}

export function getBaseUrl(config: AIConfig): string {
  if (config.customBaseUrl) return config.customBaseUrl
  return getPreset(config.provider).baseUrl
}

export function getProviderHeaders(config: AIConfig): Record<string, string> {
  if (config.provider === "gemini") {
    return { "Content-Type": "application/json" }
  }
  if (config.provider === "claude") {
    return {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    }
  }
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`,
  }
  if (config.provider === "openrouter") {
    base["HTTP-Referer"] = "https://nodepad.space"
    base["X-Title"] = "nodepad"
  }
  return base
}

/** @deprecated Use loadAIConfig() for direct browser → provider calls.
 *  Kept for any remaining server-route usage during transition. */
export function getAIHeaders(): Record<string, string> {
  const config = loadAIConfig()
  if (!config) return {}
  const models = getModelsForProvider(config.provider)
  const model = models.find(m => m.id === config.modelId) || AI_MODELS.find(m => m.id === DEFAULT_MODEL_ID)!
  return {
    "x-or-key": config.apiKey,
    "x-or-model": config.modelId,
    "x-or-supports-grounding": model.supportsGrounding ? "true" : "false",
  }
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>({
    apiKey: "", modelId: DEFAULT_MODEL_ID, webGrounding: false,
    provider: DEFAULT_PROVIDER, customBaseUrl: "",
  })

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSettings = useCallback((patch: Partial<AISettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const models = getModelsForProvider(settings.provider)

  const resolvedModelId = (() => {
    const model = models.find(m => m.id === settings.modelId) || models[0]
    if (!model) return settings.modelId
    if (settings.provider === "openrouter" && settings.webGrounding && model.supportsGrounding) {
      return `${model.id}:online`
    }
    return model.id
  })()

  const currentModel: AIModel = models.find(m => m.id === settings.modelId) || models[0] || {
    id: settings.modelId,
    label: settings.modelId,
    shortLabel: settings.modelId.split("/").pop() || settings.modelId,
    description: "Custom model",
    supportsGrounding: false,
  }

  return { settings, updateSettings, resolvedModelId, currentModel, models }
}
