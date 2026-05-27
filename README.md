# nodepad (Custom Fork)

**A design experiment in spatial, AI-augmented thinking.**
**공간적이고 AI가 증강된 사고를 위한 디자인 실험.**

[![Watch the intro](https://img.youtube.com/vi/nCLY7rHAjWE/maxresdefault.jpg)](https://www.youtube.com/watch?v=nCLY7rHAjWE)

*[Watch the intro →](https://www.youtube.com/watch?v=nCLY7rHAjWE)*

---

## ✨ What's New in this Fork? (이 포크 버전의 새로운 기능)

This version is a heavily refactored fork of the original nodepad, designed for better maintainability, localization, and extensibility.
이 버전은 유지보수, 지역화(다국어), 그리고 확장성을 위해 원본 nodepad를 대대적으로 리팩토링한 커스텀 포크입니다.

- **i18n Support (Korean/English):** Full UI localization with a real-time language switcher in the status bar (`lib/i18n.ts`), plus enforced AI prompt language directives (`[RESPOND IN: Korean]`).
- **다국어 지원 (한/영):** 상태 표시줄에 실시간 언어 전환기를 추가하고 UI 전체를 번역했으며, AI 프롬프트에 `[RESPOND IN: Korean]` 지시어를 강제하여 안정적인 한국어 출력을 보장합니다.

- **Zustand State Management:** Migrated from massive monolithic React `useState` hooks to a clean, persistent **Zustand** store (`lib/store.ts`).
- **Zustand 상태 관리:** 거대하고 복잡했던 React `useState` 구조를 깔끔하고 영구적인 **Zustand** 스토어로 마이그레이션했습니다.

- **Decoupled AI Hooks:** Heavy background logic (like `enrichBlock` and `generateGhostNote`) has been extracted into modular custom hooks (`useNodepadAI`).
- **분리된 AI 훅:** `enrichBlock`이나 `generateGhostNote` 같은 무거운 백그라운드 로직들을 모듈화된 커스텀 훅으로 추출했습니다.

- **Scalable Theming System:** Reorganized `globals.css` with CSS variables and data-attributes (e.g. `[data-theme="soft-rounded"]`) to allow easy aesthetic variations.
- **확장 가능한 테마 시스템:** `globals.css`를 CSS 변수와 데이터 속성(예: `[data-theme="soft-rounded"]`) 기반으로 재구성하여 손쉬운 디자인 바리에이션이 가능합니다.

- **Enhanced UI/UX:** Clickable `Cmd+Z`/`Cmd+K` buttons, interactive `#` autocomplete dropdown to force content types, detailed error cards, and Tiling view improvements (sticky Task cards, smooth automatic scrolling).
- **UI/UX 개선:** 입력창에서 `Cmd+Z`, `Cmd+K` 버튼 클릭 상호작용 지원, `#` 기호를 이용한 콘텐츠 타입 자동완성 드롭다운, 디테일한 에러 카드 표시, 그리고 타일 뷰에서 Task 카드 상단 고정 및 부드러운 자동 스크롤 기능을 추가했습니다.

- **Inception Mercury API Support:** Added native support for InceptionLabs Mercury API. Mercury is a diffusion-based LLM that generates tokens in parallel, making it extremely fast (1000+ tokens/sec) and ideal for real-time agentic workflows. It also offers a generous free tier without requiring a credit card.
- **Inception Mercury API 지원:** InceptionLabs의 Mercury API를 기본 지원합니다. Mercury는 기존의 순차적(Autoregressive) 방식이 아닌 디퓨전(Diffusion) 기반의 아키텍처를 사용하여 토큰을 병렬로 생성합니다. 이로 인해 초당 1,000토큰 이상의 압도적인 속도를 보여주며, 지연 시간이 없는 실시간 AI 워크플로우에 완벽하게 적합합니다. 또한 카드 등록 없이 넉넉한 량의 무료 토큰(10M)을 제공합니다.

- **Bug Fixes:** Resolved Korean IME composition duplication bugs and prevented subtask duplications.
- **버그 수정:** 한글 타이핑 중 엔터키 입력 시 글자가 중복되는 IME 버그와 서브태스크 중복 생성 문제를 해결했습니다.

- **AI-Agent Ready:** Includes a `.cursorrules` file detailing architectural guidelines for AI coding assistants.
- **AI 에이전트 최적화:** 향후 AI 코딩 어시스턴트(Cursor 등)를 위한 아키텍처 가이드라인이 담긴 `.cursorrules` 파일을 포함하고 있습니다.

---

Most AI tools are built around a chat interface: you ask, it answers, you ask again. The interaction is sequential, conversational, and optimised for producing output. nodepad is built around a different premise: that thinking is spatial and associative, and that AI is most useful when it works quietly in the background rather than at the centre of attention.

대부분의 AI 도구는 채팅 인터페이스를 기반으로 합니다: 묻고, 대답을 듣고, 다시 묻는 방식이죠. 이런 상호작용은 순차적이고 대화형이며 출력 생성에 최적화되어 있습니다. 반면 nodepad는 다른 전제에서 출발합니다: '사고는 공간적이고 연관적이며, AI는 중심에 나서기보다 백그라운드에서 조용히 작동할 때 가장 유용하다'는 것입니다.

You add notes. The AI classifies them, finds connections between them, surfaces what you haven't said yet, and occasionally synthesises an emergent insight from the whole canvas. You stay in control of the space. The AI earns its place by being genuinely useful rather than prominent.

사용자가 노트를 추가하면, AI가 이를 분류하고 노트 간의 연결 고리를 찾으며 사용자가 아직 언급하지 않은 부분을 수면 위로 끌어올립니다. 그리고 때때로 전체 캔버스에서 떠오르는 통찰력을 합성해 냅니다. 공간의 통제권은 여전히 사용자에게 있습니다. AI는 눈에 띄기보다는 진정으로 유용하게 쓰임으로써 자신의 가치를 증명합니다.

---

## How it works (작동 방식)

Notes are typed into the input bar and placed onto a spatial canvas. Each note is automatically classified into one of 14 types — claim, question, idea, task, entity, quote, reference, definition, opinion, reflection, narrative, comparison, thesis, general — and enriched with a short annotation that adds something the note doesn't already say.

입력창에 노트를 치면 공간 캔버스 위에 배치됩니다. 각 노트는 14가지 타입(주장, 질문, 아이디어, 태스크, 엔티티, 인용구, 레퍼런스, 정의, 의견, 성찰, 내러티브, 비교, 테제, 일반) 중 하나로 자동 분류되며, 노트에 적히지 않은 내용을 추가해 주는 짧은 주석(Annotation)으로 풍성해집니다.

Connections between notes are inferred from content. When you hover a connection indicator, unrelated notes dim. When enough notes accumulate, a synthesis emerges — a single sentence that bridges the tensions across the canvas. You can solidify it into a thesis note or dismiss it.

노트 간의 연결은 내용을 바탕으로 추론됩니다. 연결 표시기에 마우스를 올리면 관련 없는 노트들은 흐려집니다. 충분한 양의 노트가 쌓이면 캔버스 전체의 텐션을 이어주는 단 하나의 문장인 '합성(Synthesis)'이 떠오릅니다. 이를 테제(Thesis) 노트로 굳히거나 무시할 수 있습니다.

Three views: **tiling** (spatial BSP grid), **kanban** (grouped by type), **graph** (force-directed, centrality-radial).
세 가지 뷰를 제공합니다: **타일링(Tiling)** (공간적 BSP 그리드), **칸반(Kanban)** (타입별 그룹화), **그래프(Graph)** (물리 엔진 기반 중앙 집중 방사형).

---

## Setup (설치 및 설정)

**Requirements (요구사항)**: a desktop browser and an [OpenRouter](https://openrouter.ai) API key. (데스크톱 브라우저와 OpenRouter API 키가 필요합니다.)

```bash
git clone https://github.com/Junek00/Spatial.git
cd Spatial
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). (브라우저에서 열기)

**Add your API key (API 키 추가하기)**: click the menu icon (top-left) → Settings → paste your OpenRouter key. The key is stored in your browser's `localStorage` and goes directly to OpenRouter — it never passes through any server.
(좌측 상단 메뉴 아이콘 클릭 → 설정(Settings) → OpenRouter 키를 붙여넣으세요. 키는 브라우저의 `localStorage`에만 저장되며 서버를 거치지 않고 OpenRouter로 직접 전송됩니다.)

**Enable web grounding (웹 검색 기능 활성화)** (optional): toggle "Web grounding" in Settings to let the AI cite real sources for claims, questions, and references. Works with models that support the `:online` suffix.
(설정에서 "Web grounding"을 켜면 AI가 주장, 질문 등에 대해 실제 출처를 인용할 수 있습니다. `:online` 접미사를 지원하는 모델에서 작동합니다.)

---

## Models (지원 모델)

Select from the sidebar Settings panel. Default is GPT-4o.
사이드바 설정 패널에서 선택할 수 있습니다. 기본값은 GPT-4o입니다.

| Model | Notes (특징) |
|---|---|
| `openai/gpt-4o` | Default. Strong annotation quality. (기본 모델. 주석 품질이 우수함) |
| `anthropic/claude-sonnet-4-5` | Strong reasoning, good for complex research. (추론 능력이 뛰어나며 복잡한 연구에 적합함) |
| `inceptionlabs/mercury` | Extremely fast (diffusion-based), large free tier. (디퓨전 기반의 압도적인 속도, 넉넉한 무료 토큰 제공) |
| `google/gemini-2.5-pro` | Supports web grounding. (웹 검색 기능 지원) |
| `deepseek/deepseek-chat` | Fast, cost-effective. (빠르고 가성비가 좋음) |

---

## Keyboard shortcuts (키보드 단축키)

| Key | Action (동작) |
|---|---|
| `Enter` | Add note (노트 추가) |
| `⌘K` | Command palette (명령어 팔레트 열기) |
| `⌘Z` | Undo (실행 취소) |
| `Escape` | Deselect / close panels (선택 해제 / 패널 닫기) |

Double-click any note to edit. Click the type label to reclassify manually.
노트를 더블클릭하면 편집할 수 있습니다. 타입 라벨을 클릭하면 수동으로 분류를 변경할 수 있습니다.

---

## Data (데이터 저장)

Everything lives in your browser. No account, no server, no database.
모든 데이터는 브라우저 내에 저장됩니다. 계정, 서버, 데이터베이스가 필요 없습니다.

- Notes are persisted to `localStorage` under `nodepad-projects` (노트는 `localStorage`에 영구 저장됨)
- A silent rolling backup is written on every change to `nodepad-backup` (변경 시마다 조용히 백업됨)
- Export to `.md` or `.nodepad` (versioned JSON) via `⌘K` (`⌘K`를 눌러 Markdown 또는 JSON으로 내보내기 가능)
- Import `.nodepad` files via the sidebar (사이드바에서 파일 가져오기 가능)

---

## Tech (기술 스택)

Next.js · React 19 · TypeScript · Tailwind CSS v4 · Zustand · D3.js · Framer Motion · OpenRouter API

---

A design experiment by [Saleh Kayyali](http://mskayyali.com).
