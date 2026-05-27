"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Settings,
  Trash2,
  Check,
  X,
  Edit3,
  LayoutGrid,
  ArrowLeft,
  Key,
  ChevronDown,
  Globe,
  Eye,
  EyeOff,
  Save,
  FolderInput,
  Search,
  Sun,
  Moon,
  Languages,
  Info,
} from "lucide-react"
import {
  AI_PROVIDER_PRESETS,
  getModelsForProvider,
  getPreset,
  fetchModelsFromProvider,
  type AISettings,
  type AIProvider,
  type FetchedModel,
} from "@/lib/ai-settings"
import { useTranslation } from "@/lib/i18n"
import { useTheme } from "next-themes"
import { useStore } from "@/lib/store"
import { AboutPanel } from "@/components/about-panel"

interface Project {
  id: string
  name: string
  blocks: any[]
  collapsedIds: string[]
}

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  activeProjectId: string
  onSelectProject: (id: string) => void
  onCreateProject: () => void
  onImportProject: () => void
  onRenameProject: (id: string, newName: string) => void
  onDeleteProject: (id: string) => void
  openToSettings?: boolean
  onSettingsOpened?: () => void
  // AI Settings
  aiSettings: AISettings
  onUpdateAISettings: (patch: Partial<AISettings>) => void
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onImportProject,
  onRenameProject,
  onDeleteProject,
  aiSettings,
  onUpdateAISettings,
  openToSettings,
  onSettingsOpened,
}: ProjectSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [providerOpen, setProviderOpen] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<FetchedModel[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [modelSearch, setModelSearch] = useState("")
  // local draft for settings (only save on "Save")
  const [draft, setDraft] = useState<AISettings>(aiSettings)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t, lang } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const setLanguage = useStore(state => state.setLanguage)
  const [mounted, setMounted] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  // Sync draft when panel opens
  useEffect(() => {
    if (showSettings) setDraft(aiSettings)
  }, [showSettings])

  // Jump straight to settings when requested externally
  useEffect(() => {
    if (openToSettings) {
      setShowSettings(true)
      onSettingsOpened?.()
    }
  }, [openToSettings])

  // Auto-fetch models when provider + key are available (debounced)
  useEffect(() => {
    if (!showSettings || !draft.apiKey.trim()) {
      setFetchedModels([])
      setFetchingModels(false)
      setFetchError(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      setFetchingModels(true)
      setFetchError(null)
      fetchModelsFromProvider(draft.provider, draft.apiKey.trim(), draft.customBaseUrl)
        .then(models => {
          if (!cancelled) {
            setFetchedModels(models.sort((a, b) => a.id.localeCompare(b.id)))
            setFetchingModels(false)
          }
        })
        .catch(err => {
          if (!cancelled) {
            setFetchedModels([])
            setFetchError(err instanceof Error ? err.message : "Failed to fetch models")
            setFetchingModels(false)
          }
        })
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [showSettings, draft.provider, draft.apiKey, draft.customBaseUrl])

  const handleRename = (id: string) => {
    if (editName.trim()) onRenameProject(id, editName.trim())
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    onDeleteProject(id)
    setDeletingId(null)
  }

  const handleSaveSettings = () => {
    // Persist this provider's key so switching back restores it
    const providerKeys: Partial<Record<AIProvider, string>> = {
      ...(draft.providerKeys ?? {}),
      [draft.provider]: draft.apiKey,
    }
    onUpdateAISettings({ ...draft, providerKeys })
    setShowSettings(false)
  }

  const currentPreset = getPreset(draft.provider)
  const models = getModelsForProvider(draft.provider)
  const selectedModel = models.find(m => m.id === draft.modelId) || models[0] || undefined

  return (
    <div
      style={{
        width: isOpen ? 240 : 0,
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? "visible" : "hidden"
      }}
      className="relative z-50 transition-all duration-200 ease-in-out overflow-hidden border-r border-border bg-sidebar backdrop-blur-3xl flex flex-col h-full"
    >
      <div className="flex flex-col h-full w-[240px]">
        {/* Header */}
        <div className="flex h-10 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-3 py-1.5 shrink-0">
          <div className="flex items-center gap-2.5">
            {showSettings ? (
              <button
                onClick={() => setShowSettings(false)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="font-mono text-xs font-bold uppercase tracking-tight">설정</span>
              </button>
            ) : (
              <>
                <div className="flex items-center justify-center h-5 w-5 bg-primary/10 rounded-sm">
                  <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-tight text-foreground/80 select-none">
                  스페이스
                </h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-muted rounded-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content — animated slide between projects/settings */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            {!showSettings ? (
              <motion.div
                key="projects"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar"
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`group relative rounded-sm transition-all duration-150 ${
                      activeProjectId === project.id
                        ? "bg-primary/10 shadow-[inset_0_1px_0px_rgba(0,0,0,0.05)]"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center p-2 px-2.5">
                      <button
                        onClick={() => onSelectProject(project.id)}
                        className="flex-1 text-left flex flex-col gap-0 overflow-hidden"
                      >
                        {editingId === project.id ? (
                          <input
                            ref={inputRef}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(project.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            onBlur={() => handleRename(project.id)}
                            className="bg-transparent font-mono text-xs font-bold text-foreground focus:outline-none w-full border-b border-primary/50 py-0"
                          />
                        ) : (
                          <span className={`font-mono text-[12px] font-bold truncate ${
                            activeProjectId === project.id ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                          }`}>
                            {project.name}
                          </span>
                        )}
                        <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-tighter font-bold">
                          {project.blocks.length} 노드
                        </span>
                      </button>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingId !== project.id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditName(project.name)
                                setEditingId(project.id)
                              }}
                              className="p-1 hover:bg-muted rounded-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            {projects.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingId(project.id)
                                }}
                                className="p-1 hover:bg-destructive/20 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Confirmation Overlay */}
                    <AnimatePresence>
                      {deletingId === project.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0 }}
                          className="absolute inset-0 z-10 bg-destructive/95 backdrop-blur-md rounded-sm flex items-center justify-between px-3"
                        >
                          <span className="font-mono text-[8px] font-bold text-destructive-foreground uppercase tracking-tighter">
                            스페이스 삭제?
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="p-1 bg-destructive-foreground/20 hover:bg-destructive-foreground/30 rounded-full text-destructive-foreground transition-colors"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="p-1 bg-background/30 hover:bg-background/40 rounded-full text-destructive-foreground transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 overflow-y-auto px-3 py-4 flex flex-col gap-4 custom-scrollbar"
              >
                {/* General Settings */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-muted-foreground">General</span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-3 w-full px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    {mounted && (resolvedTheme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />)}
                    <div>
                      <div className="font-mono text-[11px] font-bold text-foreground">{t("toggleTheme")}</div>
                      <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                        {resolvedTheme === "dark" ? "Dark mode" : "Light mode"}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setLanguage(lang === "ko" ? "en" : "ko")}
                    className="flex items-center gap-3 w-full px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-foreground">{t("toggleLanguage")}</div>
                      <div className="font-mono text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">
                        {lang === "ko" ? "한국어" : "English"}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsAboutOpen(true)}
                    className="flex items-center gap-3 w-full px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-foreground">{t("aboutNodepad")}</div>
                      <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                        {t("helpTooltip")}
                      </div>
                    </div>
                  </button>
                </div>

                {/* AI Settings */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-primary">AI Provider</span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  <label className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    제공업체
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setProviderOpen(v => !v)}
                      className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-2 text-left hover:bg-muted/50 focus:outline-none transition-colors"
                    >
                      <span className="font-mono text-[11px] font-bold text-foreground">{currentPreset.label}</span>
                      <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${providerOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {providerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.1 }}
                          className="absolute top-full left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-xl"
                        >
                          {AI_PROVIDER_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => {
                                const newModels = getModelsForProvider(preset.id)
                                setDraft(d => ({
                                  ...d,
                                  provider: preset.id,
                                  modelId: newModels[0]?.id ?? d.modelId,
                                  webGrounding: d.webGrounding,
                                  customBaseUrl: "",
                                  // Restore the saved key for this provider if one exists,
                                  // otherwise clear so the user knows to enter a new one.
                                  apiKey: d.providerKeys?.[preset.id] ?? "",
                                }))
                                setProviderOpen(false)
                              }}
                              className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left hover:bg-muted/50 transition-colors"
                            >
                              <div className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                                draft.provider === preset.id ? "border-primary bg-primary/20" : "border-border"
                              }`}>
                                {draft.provider === preset.id && <Check className="h-2.5 w-2.5 text-primary" />}
                              </div>
                              <span className="font-mono text-[10px] font-bold text-foreground">{preset.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* API Key */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    API 키
                  </label>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-2 focus-within:border-primary/50 transition-colors">
                    <Key className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      value={draft.apiKey}
                      onChange={e => setDraft(d => ({ ...d, apiKey: e.target.value }))}
                      placeholder={currentPreset.keyPlaceholder || "API 키를 입력하세요"}
                      className="flex-1 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/40"
                      style={showKey ? undefined : { WebkitTextSecurity: "disc" } as never}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button onClick={() => setShowKey(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
                    로컬에 저장됩니다. 서버로 전송되지 않습니다.{" "}
                    {currentPreset.keyUrl && (
                      <a href={currentPreset.keyUrl} target="_blank" rel="noopener noreferrer"
                        className="text-primary underline hover:brightness-125 transition-all">
                        키 발급하기 →
                      </a>
                    )}
                  </p>
                </div>

                {/* Custom Base URL */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Custom Base URL
                  </label>
                  <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2 focus-within:border-primary/50 transition-colors">
                    <input
                      type="text"
                      value={draft.customBaseUrl ?? ""}
                      onChange={e => setDraft(d => ({ ...d, customBaseUrl: e.target.value }))}
                      placeholder="Optional — for local/self-hosted endpoints"
                      className="flex-1 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/40"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
                    Override the provider URL. Useful for Ollama, LM Studio, vLLM, or other OpenAI-compatible endpoints.
                  </p>
                </div>

                {/* Model Selector */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    모델
                  </label>
                  {models.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-2 focus-within:border-primary/50 transition-colors">
                      <input
                        type="text"
                        value={draft.modelId}
                        onChange={e => setDraft(d => ({ ...d, modelId: e.target.value }))}
                        placeholder="예: gpt-4o, claude-3-opus-20240229"
                        className="flex-1 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/40"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => { setModelOpen(v => { if (v) setModelSearch(""); return !v }) }}
                        className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-2 text-left hover:bg-muted/50 focus:outline-none transition-colors"
                      >
                        <div>
                          <div className="font-mono text-[11px] font-bold text-foreground">{selectedModel?.label ?? draft.modelId}</div>
                          <div className="font-mono text-[9px] text-muted-foreground mt-0.5">{selectedModel?.description ?? "사용자 지정 모델 ID"}</div>
                        </div>
                        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${modelOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {modelOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-xl"
                          >
                            {/* Search input */}
                            <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border">
                              <Search className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                              <input
                                type="text"
                                value={modelSearch}
                                onChange={e => setModelSearch(e.target.value)}
                                placeholder="모델 검색…"
                                className="flex-1 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
                                autoFocus
                                spellCheck={false}
                              />
                            </div>
                            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                              {/* Preset / recommended models */}
                              {models
                                .filter(model => !modelSearch || model.label.toLowerCase().includes(modelSearch.toLowerCase()) || model.id.toLowerCase().includes(modelSearch.toLowerCase()))
                                .map(model => (
                                  <button
                                    key={model.id}
                                    onClick={() => {
                                      setDraft(d => ({ ...d, modelId: model.id, webGrounding: model.supportsGrounding ? d.webGrounding : false }))
                                      setModelOpen(false)
                                      setModelSearch("")
                                    }}
                                    className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left hover:bg-muted/50 transition-colors"
                                  >
                                    <div className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                                      draft.modelId === model.id ? "border-primary bg-primary/20" : "border-border"
                                    }`}>
                                      {draft.modelId === model.id && <Check className="h-2.5 w-2.5 text-primary" />}
                                    </div>
                                    <div>
                                      <div className="font-mono text-[10px] font-bold text-foreground">{model.label}</div>
                                      <div className="font-mono text-[9px] text-muted-foreground">{model.description}</div>
                                    </div>
                                    {model.supportsGrounding && (draft.provider === "openrouter" || draft.provider === "openai") && <Globe className="ml-auto h-3 w-3 shrink-0 text-primary/50" />}
                                  </button>
                                ))}

                              {/* Fetched models from provider API */}
                              {fetchedModels.length > 0 && (
                                <>
                                  <div className="px-2.5 py-1.5 border-t border-border">
                                    <span className="font-sans text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                                      사용 가능한 모든 모델 ({fetchedModels.length})
                                    </span>
                                  </div>
                                  {fetchedModels
                                    .filter(fm => !models.some(m => m.id === fm.id))
                                    .filter(fm => {
                                      if (!modelSearch) return true
                                      const q = modelSearch.toLowerCase()
                                      return fm.id.toLowerCase().includes(q) ||
                                        (fm.name && fm.name.toLowerCase().includes(q)) ||
                                        (fm.description && fm.description.toLowerCase().includes(q))
                                    })
                                    .map(fm => {
                                      const displayName = fm.name || fm.id.split("/").pop() || fm.id
                                      const shortDesc = fm.description
                                        ? fm.description.length > 80
                                          ? fm.description.slice(0, 80).trimEnd() + "…"
                                          : fm.description
                                        : null
                                      return (
                                        <button
                                          key={fm.id}
                                          onClick={() => {
                                            setDraft(d => ({ ...d, modelId: fm.id, webGrounding: false }))
                                            setModelOpen(false)
                                            setModelSearch("")
                                          }}
                                          className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-muted/50 transition-colors"
                                        >
                                          <div className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                                            draft.modelId === fm.id ? "border-primary bg-primary/20" : "border-border"
                                          }`}>
                                            {draft.modelId === fm.id && <Check className="h-2.5 w-2.5 text-primary" />}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-sans text-[11px] font-bold text-foreground">{displayName}</span>
                                              {fm.isFree && (
                                                <span className="font-sans text-[7px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-1 py-px rounded">Free</span>
                                              )}
                                            </div>
                                            {shortDesc && (
                                              <div className="font-sans text-[9px] text-muted-foreground leading-snug mt-0.5">{shortDesc}</div>
                                            )}
                                          </div>
                                        </button>
                                      )
                                    })}
                                </>
                              )}

                              {fetchingModels && (
                                <div className="px-2.5 py-2 flex items-center gap-2 border-t border-border mt-1">
                                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                  <span className="font-sans text-[9px] text-muted-foreground">모델 불러오는 중…</span>
                                </div>
                              )}
                              {fetchError && !fetchingModels && (
                                <div className="px-2.5 py-2 border-t border-border mt-1">
                                  <span className="font-sans text-[9px] text-destructive/70">{fetchError}</span>
                                </div>
                              )}
                              {!fetchingModels && modelSearch && (() => {
                                const q = modelSearch.toLowerCase()
                                const presetHits = models.filter(m => m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)).length
                                const fetchedHits = fetchedModels.filter(fm => !models.some(m => m.id === fm.id)).filter(fm => fm.id.toLowerCase().includes(q) || (fm.name && fm.name.toLowerCase().includes(q)) || (fm.description && fm.description.toLowerCase().includes(q))).length
                                return presetHits === 0 && fetchedHits === 0
                              })() && (
                                <div className="px-2.5 py-2 border-t border-border mt-1">
                                  <span className="font-sans text-[9px] text-muted-foreground/50">"{modelSearch}" {t("noModelFound")}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Web Grounding (OpenRouter + OpenAI) */}
                {(draft.provider === "openrouter" || draft.provider === "openai") && selectedModel && (
                  <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/20 px-2.5 py-2.5">
                    <div className="flex items-start gap-2">
                      <Globe className="h-3.5 w-3.5 mt-0.5 text-primary/60 shrink-0" />
                      <div>
                        <div className="font-mono text-[11px] font-bold text-foreground">{t("webGrounding")}</div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-0.5 leading-relaxed">
                          {selectedModel.supportsGrounding
                            ? draft.provider === "openai"
                              ? `${t("realtimeSearchPrefix")} ${selectedModel.groundingModelId ?? "search-preview"} ${t("realtimeSearchSuffix")}`
                              : `:online ${t("realtimeSearchSuffix")}`
                            : t("notAvailableForModel")}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => selectedModel.supportsGrounding && setDraft(d => ({ ...d, webGrounding: !d.webGrounding }))}
                      disabled={!selectedModel.supportsGrounding}
                      className={`relative shrink-0 h-5 w-9 rounded-full transition-all duration-200 ${
                        draft.webGrounding && selectedModel.supportsGrounding ? "bg-primary" : "bg-muted"
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-all duration-200 ${
                        draft.webGrounding && selectedModel.supportsGrounding ? "left-5" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                )}

                {/* API Status */}
                <div className={`flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-[9px] ${
                  draft.apiKey
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : "bg-muted/30 border border-border text-muted-foreground"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${draft.apiKey ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                  {draft.apiKey ? `${currentPreset.label} — ${t("apiKeySet")}` : t("apiKeyMissing")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card/50 shrink-0">
          {showSettings ? (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleSaveSettings}
                className="flex items-center justify-between w-full h-8 px-2.5 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-sm"
              >
                <span>{t("saveSettings")}</span>
                <Save className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex items-center justify-center w-full h-8 px-2.5 rounded-sm bg-muted/50 hover:bg-muted text-muted-foreground font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.98] border border-border"
              >
                {t("cancel")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={onCreateProject}
                className="flex items-center justify-between w-full h-8 px-2.5 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-sm"
              >
                <span>{t("newSpace")}</span>
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onImportProject}
                className="flex items-center justify-between w-full h-8 px-2.5 rounded-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.98] border border-border"
              >
                <span>{t("importNodepad")}</span>
                <FolderInput className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-between w-full h-8 px-2.5 rounded-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.98] border border-border"
              >
                <span>{t("settings")}</span>
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <AboutPanel open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  )
}
