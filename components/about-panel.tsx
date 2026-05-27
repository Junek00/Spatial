"use client"

import { useState, useCallback } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CONTENT_TYPE_CONFIG } from "@/lib/content-types"
import {
  Sparkles, Layers, Kanban, GitFork, FolderDown,
  FolderInput, Download, Brain, Zap, Globe, Search, Check, Mail
} from "lucide-react"
import { useModKey } from "@/lib/utils"
import { useStore } from "@/lib/store"

interface AboutPanelProps {
  open: boolean
  onClose: () => void
}

function CopyEmailButton() {
  const [copied, setCopied] = useState(false)
  const lang = useStore(state => state.language)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("mskayyali@me.com").then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-sm transition-all duration-300 cursor-pointer"
      style={{
        color:       copied ? "var(--color-emerald-400, #34d399)" : "color-mix(in oklch, var(--primary) 60%, transparent)",
        borderColor: copied ? "color-mix(in oklch, var(--color-emerald-400, #34d399) 35%, transparent)" : "color-mix(in oklch, var(--primary) 25%, transparent)",
      }}
    >
      <span className="relative flex items-center" style={{ width: "12px", height: "12px" }}>
        <Mail
          className="absolute inset-0 transition-all duration-300"
          style={{ width: "12px", height: "12px", opacity: copied ? 0 : 1, transform: copied ? "scale(0.6)" : "scale(1)" }}
        />
        <Check
          className="absolute inset-0 transition-all duration-300"
          style={{ width: "12px", height: "12px", opacity: copied ? 1 : 0, transform: copied ? "scale(1)" : "scale(0.6)" }}
        />
      </span>
      <span className="transition-all duration-300" style={{ opacity: copied ? 0.7 : 1 }}>
        {copied ? (lang === "ko" ? "복사됨!" : "Copied!") : (lang === "ko" ? "이메일 복사" : "Copy email")}
      </span>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 font-mono text-[10px] font-black text-primary">
        {n}
      </div>
      <div className="space-y-1 pt-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd key={i} className="px-1.5 py-0.5 rounded-sm bg-secondary border border-border font-mono text-[10px] text-foreground">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  )
}

const CONTENT_TYPE_HIGHLIGHTS = [
  "claim", "question", "idea", "task", "thesis", "quote", "entity", "reference"
] as const

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  const mod = useModKey()
  const lang = useStore(state => state.language)
  
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col gap-0 p-0 bg-card border-l border-border z-[200] overflow-hidden"
      >
        <SheetTitle className="sr-only">About nodepad</SheetTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-0.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/60" />
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/30" />
            </div>
            <h1 className="font-mono text-xl font-black text-foreground tracking-tight">nodepad</h1>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            {lang === "ko" 
              ? "사용자가 글을 쓰면 AI가 이를 읽고 내용을 보완해주는 공간 연구 도구입니다. 프롬프팅도, 채팅도 필요 없습니다. 그저 생각을 적어 내려가면 자연스럽게 구조가 잡힙니다." 
              : "A spatial research tool that reads what you write and enriches it with AI — no prompting, no chat. Just capture your thinking and let the structure emerge."}
          </p>
          <p className="mt-2 text-xs font-mono text-primary/60 uppercase tracking-widest">
            {lang === "ko" ? "채팅 없음 · 프롬프트 없음 · 사고를 확장하는 AI" : "No chat · No prompts · AI that augments your thinking"}
          </p>
          <p className="mt-3 text-xs text-muted-foreground/50 flex items-center gap-3 flex-wrap">
            <span>
              {lang === "ko" ? "디자인 실험: " : "A design experiment by "}
              <a
                href="http://mskayyali.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Saleh Kayyali
              </a>
            </span>
            <a
              href="https://github.com/mskayyali/nodepad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 hover:text-foreground border border-white/10 hover:border-white/25 px-2 py-0.5 rounded-sm transition-colors"
            >
              {lang === "ko" ? "소스 코드 ↗" : "Source code ↗"}
            </a>
            <CopyEmailButton />
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/35">
            {lang === "ko"
              ? "이 앱은 기능 상호작용(뷰 전환, 내보내기, 합성 등)을 추적하기 위해 익명화된 분석 도구(Umami)를 사용합니다. 노트 내용이나 개인 데이터, 사이트 간 추적 데이터는 절대 수집하지 않습니다."
              : "This app uses anonymous analytics (Umami) to track feature interactions — views switched, exports, synthesis events. No note content, no personal data, no cross-site tracking."}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* Intro video */}
          <Section title={lang === "ko" ? "소개 영상 시청" : "Watch the intro"}>
            <div className="relative w-full rounded-sm overflow-hidden border border-border/50" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube-nocookie.com/embed/nCLY7rHAjWE?rel=0&modestbranding=1&color=white"
                title="nodepad introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Section>

          {/* The idea */}
          <Section title={lang === "ko" ? "아이디어" : "The idea"}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "ko"
                ? "대부분의 AI 도구는 사용자에게 프롬프트를 요구합니다. nodepad는 이를 뒤집었습니다. 자유롭게 글을 쓰면, AI가 조용히 모든 내용을 읽고 분류하며, 주석을 달고, 모순을 찾거나 연결고리를 발견하여 새로운 통찰을 합성해냅니다. 생각이 흘러감에 따라 캔버스도 함께 진화합니다."
                : "Most AI tools ask you to prompt them. nodepad flips this — you write freely, and the AI quietly reads everything you've captured, classifies it, annotates it, finds contradictions, surfaces connections, and synthesises emerging insights. Your canvas evolves as you think."}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "ko"
                ? "단순한 챗봇이 아닌, 연구자, 작가, 그리고 깊이 생각하는 사람들을 위한 훌륭한 사고 파트너로 설계되었습니다. 원초적인 생각이 구조화된 통찰로 변하는 과정의 마찰을 줄이는 것이 핵심 목표입니다."
                : "It's designed for researchers, writers, and deep thinkers who want a thinking partner — not a chatbot. The goal is to reduce the friction between a raw thought and a structured insight."}
            </p>
          </Section>

          {/* Quick start */}
          <Section title={lang === "ko" ? "빠른 시작" : "Quick start"}>
            <div className="space-y-4">
              <Step n={1} title={lang === "ko" ? "API 키 추가" : "Add your API key"}>
                {lang === "ko"
                  ? "사이드바(좌측 상단 메뉴 버튼) → 설정(Settings)을 열고 제공업체를 선택한 후 API 키를 붙여넣으세요. OpenRouter(openrouter.ai)에서는 무료 크레딧을 제공합니다. 키가 없어도 앱은 작동하지만 AI 기능은 비활성화됩니다."
                  : "Open the sidebar (menu button top-left) → Settings → choose your provider and paste your API key. OpenRouter offers free credits at openrouter.ai. Without a key the app works but AI enrichment is disabled."}
              </Step>
              <Step n={2} title={lang === "ko" ? "무엇이든 기록하기" : "Capture anything"}>
                {lang === "ko"
                  ? "생각, 인용문, URL, 질문 등 무엇이든 하단 입력창에 적고 Enter를 누르세요. nodepad가 자동으로 분류해 줍니다."
                  : "Type a thought, paste a quote, drop a URL, or write a question into the input bar at the bottom and press Enter. nodepad classifies it automatically."}
              </Step>
              <Step n={3} title={lang === "ko" ? "AI의 보완 과정 지켜보기" : "Watch it enrich"}>
                {lang === "ko"
                  ? "각 노드는 캔버스의 모든 컨텍스트와 함께 AI에게 전송됩니다. 이후 분류 유형, 카테고리, 주석, 그리고 관련 노드들과의 연결 정보를 가지고 돌아옵니다."
                  : "Each node is sent to the AI in context with everything else on your canvas. It comes back with a type, category, annotation, and connections to related nodes."}
              </Step>
              <Step n={4} title={lang === "ko" ? "#type 태그로 강제 분류하기" : "Force a type with #type"}>
                {lang === "ko" ? (
                  <>노트의 시작을 <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#claim</code>, <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#question</code>, <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#idea</code> 같은 태그로 작성하면 AI의 자동 분류를 무시하고 해당 타입으로 고정할 수 있습니다.</>
                ) : (
                  <>Start your note with a shorthand like <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#claim</code>, <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#question</code>, or <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#idea</code> to override AI classification.</>
                )}
              </Step>
              <Step n={5} title={lang === "ko" ? "자동 합성 확인하기" : "Watch for synthesis"}>
                {lang === "ko"
                  ? "노드가 몇 개 이상 모이면, nodepad는 캔버스의 모든 내용에서 도출된 핵심 주제를 담은 합성 노트를 자동으로 생성합니다. 우측 상단의 반짝임 아이콘(합성 패널)에서 확인할 수 있습니다."
                  : "After a few nodes, nodepad auto-generates a synthesis note — an emergent thesis drawn from everything on the canvas. Find it in the Synthesis panel (top-right sparkle icon)."}
              </Step>
            </div>
          </Section>

          {/* Content types */}
          <Section title={lang === "ko" ? "콘텐츠 유형" : "Content types"}>
            <p className="text-sm text-muted-foreground mb-3">
              {lang === "ko"
                ? "nodepad는 14가지 사고 유형을 인식합니다. 각 노드는 의미에 따라 자동으로 분류되며 일치하는 색상이 부여됩니다."
                : "nodepad recognises 14 types of thinking. Each node is classified into one automatically, and given a colour to match."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPE_HIGHLIGHTS.map((type) => {
                const config = CONTENT_TYPE_CONFIG[type]
                const Icon = config.icon
                return (
                  <div key={type} className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-secondary/50 border border-border/50">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: config.accentVar }} />
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: config.accentVar }}>
                        {config.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {lang === "ko"
                ? "추가 유형: 정의(definition), 의견(opinion), 회고(reflection), 서사(narrative), 비교(comparison), 일반(general)."
                : "Also: definition, opinion, reflection, narrative, comparison, general."}
            </p>
          </Section>

          {/* Views */}
          <Section title={lang === "ko" ? "뷰 모드" : "Views"}>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <Layers className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{lang === "ko" ? "타일링 (Tiling)" : "Tiling"} <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}1</span></p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ko"
                      ? "기본 뷰입니다. 노드들은 이진 공간 분할(BSP) 그리드에 배치되며, 새 노드가 추가될 때마다 가용 공간을 분할합니다. 화면은 가로로 스크롤됩니다. 우측 하단의 미니맵을 통해 전체 위치를 파악할 수 있습니다."
                      : "Default. Nodes are laid out in a Binary Space Partition grid — each new node splits the available space. Navigate pages horizontally. A minimap in the bottom-right shows your spatial position."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <Kanban className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{lang === "ko" ? "칸반 (Kanban)" : "Kanban"} <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}2</span></p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ko"
                      ? "노드가 콘텐츠 유형별로 분류되어 열(Column)로 나타납니다. 카테고리별로 생각을 정리하고 검토할 때 유용합니다. 작업(Task)은 항상 최우선으로 표시됩니다."
                      : "Nodes grouped into columns by content type. Good for reviewing your thinking by category. Tasks always appear first."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <GitFork className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{lang === "ko" ? "그래프 (Graph)" : "Graph"} <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}3</span></p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ko"
                      ? "모든 노드를 상호작용 가능한 포스-디렉티드(Force-directed) 그래프로 보여줍니다. 노드 간의 연결성이 중심이 되며, 연결이 많은 노드는 중앙으로 모이고 고립된 노드는 가장자리로 밀려납니다. 노드를 클릭하면 세부 정보 패널이 열리며, 마우스를 올리면 관련 없는 노드들이 희미해집니다."
                      : "An interactive force-directed graph of all your nodes. Connections between them become the focus — highly-connected nodes drift toward the centre, isolated ones settle at the periphery. Click any node to open its full detail panel. Hover to dim unrelated nodes."}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* AI features */}
          <Section title={lang === "ko" ? "AI 기능" : "AI features"}>
            <div className="space-y-3">
              {[
                { icon: Brain, 
                  title: lang === "ko" ? "자동 분류" : "Auto-classification", 
                  desc: lang === "ko" ? "키워드뿐만 아니라 문맥적 의미를 바탕으로 모든 노드를 14가지 콘텐츠 유형 중 하나로 분류합니다." : "Every node is classified into one of 14 content types based on its meaning, not just its keywords." },
                { icon: Zap, 
                  title: lang === "ko" ? "맥락 기반 주석 달기" : "Contextual annotation", 
                  desc: lang === "ko" ? "AI가 전체 캔버스를 읽고, 각 노드가 다른 노드들과 어떤 맥락에서 이어지는지 설명하는 2~4문장의 주석을 달아줍니다." : "The AI reads your whole canvas and writes a 2–4 sentence annotation for each node that explains it in the context of everything else." },
                { icon: Search, 
                  title: lang === "ko" ? "연결망 매핑" : "Connection mapping", 
                  desc: lang === "ko" ? "타일 상단의 점(dot) 표시기에 마우스를 올리면 관련 없는 노드가 희미해지고 의미적으로 연결된 노드들이 강조됩니다. 그래프 뷰에서는 이 연결성을 기반으로 레이아웃이 자동 구성됩니다." : "Hover the dot indicator on any tile header to dim unrelated nodes and reveal which nodes are semantically connected. In Graph view, the same connections drive the layout — connected nodes pull toward each other." },
                { icon: Globe, 
                  title: lang === "ko" ? "웹 그라운딩" : "Web grounding", 
                  desc: lang === "ko" ? "설정에서 웹 그라운딩을 활성화하면, 주장(Claim), 질문(Question), 참고 자료(Reference) 등에 대해 실제 웹 소스를 통해 내용을 검증합니다. 출처 인용은 인라인 형태로 제공됩니다." : "Enable web grounding in settings to have claims, questions, and references verified against live sources. Citations appear inline." },
                { icon: Sparkles, 
                  title: lang === "ko" ? "합성 (Synthesis)" : "Synthesis", 
                  desc: lang === "ko" ? "3개 이상의 노드가 작성되면, nodepad가 현재 캔버스의 모든 생각들을 아우르는 15~25단어 분량의 핵심 주제(Thesis)를 조용히 도출해 냅니다. 원한다면 이를 보존하거나 지울 수 있습니다." : "After ≥3 nodes, nodepad quietly generates an emergent thesis — a 15–25 word synthesis of what you're actually thinking about. Solidify it to keep it, or dismiss." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Export & data */}
          <Section title={lang === "ko" ? "내보내기 및 데이터" : "Export & your data"}>
            <div className="space-y-3">
              <div className="flex gap-3">
                <FolderDown className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{lang === "ko" ? ".nodepad로 내보내기" : "Export .nodepad"}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ko"
                      ? "연구 공간 전체를 " : "Save your full research space as a "}
                    <code className="px-1 rounded bg-secondary font-mono text-xs">.nodepad</code>
                    {lang === "ko"
                      ? " 파일로 저장합니다. 아무 기기에서나 이를 불러와 작업을 이어갈 수 있습니다." : " file. Import it on any device to pick up where you left off."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Download className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{lang === "ko" ? "Markdown으로 내보내기" : "Export Markdown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ko"
                      ? "풍부한 포맷의 마크다운 문서로 내보냅니다. YAML 프론트 매터, 목차, 그룹화된 섹션, 주장에 대한 신뢰도 테이블, 그리고 인용된 소스가 모두 포함됩니다."
                      : "Export a richly formatted Markdown document with YAML front matter, a table of contents, grouped sections, confidence tables for claims, and cited sources."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <FolderInput className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{lang === "ko" ? "데이터 로컬 저장" : "Your data, locally"}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ko"
                      ? "모든 데이터는 브라우저의 localStorage에만 저장됩니다. 계정 생성이나 클라우드 동기화 과정이 없으며, 오직 OpenRouter(자신의 API 키)를 통해 노트의 AI 분석을 진행할 때만 서버로 텍스트가 전송됩니다."
                      : "Everything is stored in your browser's localStorage — no account, no cloud sync, no data sent to any server except your notes being enriched via OpenRouter (using your own API key)."}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Keyboard shortcuts */}
          <Section title={lang === "ko" ? "단축키" : "Keyboard shortcuts"}>
            <div className="rounded-sm border border-border overflow-hidden">
              <div className="px-3 divide-y divide-border/40">
                <Shortcut keys={[mod, "K"]} label={lang === "ko" ? "커맨드 메뉴 열기" : "Command menu"} />
                <Shortcut keys={[mod, "Z"]} label={lang === "ko" ? "실행 취소" : "Undo last action"} />
                <Shortcut keys={["Enter"]} label={lang === "ko" ? "새 노드 제출" : "Submit a new node"} />
                <Shortcut keys={["Esc"]} label={lang === "ko" ? "커맨드 메뉴 닫기 / 선택 해제" : "Close command menu / deselect"} />
              </div>
            </div>
          </Section>

          {/* Tips */}
          <Section title={lang === "ko" ? "유용한 팁" : "Tips"}>
            <ul className="space-y-2">
              {(lang === "ko" 
                ? [
                    "생각의 파편들만 적어보세요 — 구조는 nodepad가 잡아줍니다. 완전한 문장으로 적을 필요 없습니다.",
                    "여러 콘텐츠 유형을 자유롭게 섞어보세요. 주장(claim), 질문(question), 인용(quote) 등이 함께 있을 때 더욱 풍성한 캔버스가 만들어집니다.",
                    "그래프 뷰(⌘K → Graph)를 열면 어떤 노드가 생각의 중심에 있고, 주변에 있는지 한눈에 파악할 수 있습니다.",
                    "캔버스 인덱스(⌘K → Index)는 노드를 카테고리별로 그룹화합니다 — 인덱스 창에서 특정 항목에 마우스를 올리면 캔버스에서도 강조됩니다.",
                    "중요한 노드는 타일링 뷰에서 핀(Pin) 버튼을 눌러 시각적으로 눈에 띄게 고정할 수 있습니다.",
                    "작업(Task)으로 분류된 노드들은 체크리스트가 됩니다. 타일 내부에 중첩된 하위 작업도 만들 수 있습니다.",
                    "사이드바에서 새 프로젝트를 생성하여, 각기 다른 주제의 연구 공간을 서로 분리하여 관리하세요."
                  ]
                : [
                    "Write in fragments — nodepad handles the structure. You don't need to write in full sentences.",
                    "Mix types freely. A canvas with claims, questions, and quotes is richer than one with only one type.",
                    "Switch to Graph view (via ⌘K → Graph) to understand which nodes are central to your thinking and which are peripheral.",
                    "The canvas index (⌘K → Index) groups nodes by category — hovering a title in the index highlights the matching node in any view.",
                    "Pin important nodes with the pin icon in Tiling view so they stand out visually.",
                    "Tasks added to the canvas become a sub-task list — add sub-tasks by nesting them in the tile.",
                    "Use multiple projects (sidebar) to keep separate research threads isolated.",
                  ]
              ).map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 font-mono text-[10px] text-primary/50 mt-0.5 pt-px">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          {/* Footer */}
          <div className="pt-2 pb-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary" />
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary/60" />
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary/30" />
              <span className="font-mono text-[10px] font-bold text-muted-foreground/40 ml-1">nodepad</span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
