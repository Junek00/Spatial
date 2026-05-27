"use client"

import { AIConfig, getBaseUrl, getProviderHeaders } from "@/lib/ai-settings"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatOptions {
  temperature?: number
  jsonMode?: boolean
  jsonSchema?: object
}

export interface ChatResult {
  content: string
  annotations?: Array<{ type: string; url_citation?: { url: string; title?: string } }>
}

// ── Gemini adapter ────────────────────────────────────────────────────────────

async function callGemini(config: AIConfig, messages: ChatMessage[], opts: ChatOptions): Promise<ChatResult> {
  const baseUrl = getBaseUrl(config)
  const systemMsg = messages.find(m => m.role === "system")
  const userMsgs = messages.filter(m => m.role !== "system")

  const body: Record<string, unknown> = {
    contents: userMsgs.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.1,
      ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  }

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const url = `${baseUrl}/models/${config.modelId}:generateContent?key=${config.apiKey}`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error("No content in Gemini response")
  return { content }
}

// ── Claude adapter ────────────────────────────────────────────────────────────

async function callClaude(config: AIConfig, messages: ChatMessage[], opts: ChatOptions): Promise<ChatResult> {
  const baseUrl = getBaseUrl(config)
  const systemMsg = messages.find(m => m.role === "system")
  const conversationMsgs = messages.filter(m => m.role !== "system")

  const body: Record<string, unknown> = {
    model: config.modelId,
    max_tokens: 1024,
    temperature: opts.temperature ?? 0.1,
    messages: conversationMsgs.map(m => ({
      role: m.role,
      content: m.content,
    })),
  }

  if (systemMsg) {
    body.system = systemMsg.content
  }

  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: getProviderHeaders(config),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error("No content in Claude response")
  return { content }
}

// ── OpenAI-compatible adapter (OpenRouter + OpenAI) ───────────────────────────

async function callOpenAICompat(config: AIConfig, messages: ChatMessage[], opts: ChatOptions, model: string, webSearchOptions?: Record<string, unknown>): Promise<ChatResult> {
  const baseUrl = getBaseUrl(config)

  const useStrictSchema = opts.jsonSchema && !webSearchOptions
  const useJsonObject = opts.jsonMode && !useStrictSchema

  const body: Record<string, unknown> = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    ...(webSearchOptions === undefined
      ? {
          response_format: useStrictSchema
            ? { type: "json_schema", json_schema: opts.jsonSchema }
            : useJsonObject
            ? { type: "json_object" }
            : undefined,
          temperature: opts.temperature ?? 0.1,
        }
      : { web_search_options: webSearchOptions }),
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: getProviderHeaders(config),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI error (${config.provider}) ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("No content in AI response")

  const annotations: Array<{ type: string; url_citation?: { url: string; title?: string } }> =
    data.choices?.[0]?.message?.annotations ?? []

  return { content, annotations }
}

// ── Public unified call ───────────────────────────────────────────────────────

export async function callAIChat(
  config: AIConfig,
  messages: ChatMessage[],
  opts: ChatOptions = {},
  overrideModel?: string,
  webSearchOptions?: Record<string, unknown>,
): Promise<ChatResult> {
  const model = overrideModel ?? config.modelId

  if (config.provider === "gemini") {
    return callGemini({ ...config, modelId: model }, messages, opts)
  }
  if (config.provider === "claude") {
    return callClaude({ ...config, modelId: model }, messages, opts)
  }
  // openrouter or openai
  return callOpenAICompat(config, messages, opts, model, webSearchOptions)
}
