# Nodepad 디자인 시스템

Notion의 디자인 언어를 기반으로 한 Nodepad의 공식 스타일 가이드입니다.

---

## 폰트

### 사용 폰트
| 용도 | 폰트 | 설명 |
|------|------|------|
| 본문 / UI 전체 | **Pretendard Variable** | 한국어 + 영문 통합. Inter 기반 설계. |
| 고정폭 (ID, 코드) | **Geist Mono** | 노드 ID, 타임스탬프 등 |
| 아랍어 / RTL | **Vazirmatn** | 아랍어 입력 지원 |

### 로딩 방법
```css
/* globals.css 상단 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
```

### CSS 폰트 스택
```css
--font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
             "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
--font-mono: "Geist Mono", "Courier New", monospace;
```

### 폰트 크기 체계

| 용도 | Tailwind 클래스 | 실제 크기 | 사용처 |
|------|---------------|---------|------|
| 극소 메타 | `text-[10px]` | 10px | 배지 숫자 |
| 소형 레이블 | `text-xs` | 12px | 노드 타입, 타임스탬프, 카운터 |
| 서브텍스트 | `text-sm` | 14px | 메뉴 항목, 설명, 어노테이션 |
| 본문 기본 | `text-base` | 16px | 노트 본문, 입력 필드 |
| 소제목 | `text-lg` | 18px | 섹션 헤더 |

**원칙**: 한국어 가독성을 위해 최소 12px 이상 유지.

### 폰트 굵기
- `font-normal` (400) — 본문
- `font-medium` (500) — 강조, UI 레이블
- `font-semibold` (600) — 섹션 헤더
- `font-bold` (700) — 타입 배지, 중요 수치

---

## 색상 시스템

Notion 공식 팔레트 기반.

### 라이트 모드

| 변수 | Hex | 용도 |
|------|-----|------|
| `--background` | `#FFFFFF` | 메인 캔버스 배경 |
| `--foreground` | `#373530` | 기본 텍스트 |
| `--card` | `#FFFFFF` | 카드/패널 배경 |
| `--muted` | `#F1F1EF` | 비강조 배경 (호버, 구분선 영역) |
| `--muted-foreground` | `#787774` | 보조 텍스트 |
| `--border` | `#E9E9E7` | 경계선 |
| `--sidebar` | `#F7F7F5` | 사이드바 배경 |
| `--primary` | `#337EA9` | 강조색 (Notion 파랑) |
| `--primary-foreground` | `#FFFFFF` | 강조색 위 텍스트 |
| `--popover` | `#FFFFFF` | 드롭다운, 툴팁 배경 |

### 다크 모드

| 변수 | Hex | 용도 |
|------|-----|------|
| `--background` | `#191919` | 메인 캔버스 배경 |
| `--foreground` | `#D4D4D4` | 기본 텍스트 |
| `--card` | `#252525` | 카드/패널 배경 |
| `--muted` | `#252525` | 비강조 배경 |
| `--muted-foreground` | `#9B9B9B` | 보조 텍스트 |
| `--border` | `#2E2E2E` | 경계선 |
| `--sidebar` | `#1F1F1F` | 사이드바 배경 |
| `--primary` | `#2E7CD1` | 강조색 |
| `--primary-foreground` | `#FFFFFF` | 강조색 위 텍스트 |
| `--popover` | `#252525` | 드롭다운, 툴팁 배경 |

### 노트 타입별 색상 원칙
- 라이트 모드: 채도 낮은 파스텔톤 (oklch 명도 0.48~0.58)
- 다크 모드: 밝고 선명한 톤 (oklch 명도 0.65~0.75)

---

## 간격 (Spacing)

8px 그리드 시스템.

| 이름 | 값 | Tailwind | 용도 |
|------|-----|---------|------|
| 4xs | 2px | `p-0.5` | 최소 패딩 |
| 3xs | 4px | `p-1` | 아이콘 버튼 패딩 |
| 2xs | 6px | `p-1.5` | 버튼 내부 패딩 |
| xs | 8px | `p-2` | 카드 내부 패딩 |
| sm | 12px | `p-3` | 섹션 패딩 |
| md | 16px | `p-4` | 컨테이너 패딩 |
| lg | 24px | `p-6` | 큰 섹션 |
| xl | 32px | `p-8` | 페이지 여백 |

---

## 컴포넌트 규격

### 헤더 (Status Bar)
- 높이: `40px` (h-10)
- 배경: `var(--card)` + blur
- 경계선: 하단 1px `var(--border)`

### 사이드바
- 너비: `224px` (Notion 표준)
- 배경: `var(--sidebar)`
- 경계선: 우측 1px `var(--border)`

### 아이콘
- 기본 크기: `16px` (h-4 w-4) — 현재 사용 중
- Notion 표준: `22px` — 향후 업그레이드 가능

### 버튼
- 기본 border-radius: `6px` (rounded-md)
- 호버: `var(--muted)` 배경
- 활성: `var(--primary)/15` 배경 + `var(--primary)` 텍스트

### 카드 (노트 타일)
- border-radius: `8px` (rounded-lg) — Notion 표준
- 배경: `var(--card)`
- 경계선: 1px `var(--border)`
- 호버 그림자: `shadow-sm`

### 커맨드 팔레트 (⌘K)
- 배경: `var(--popover)`
- 경계선: 1px `var(--border)`
- border-radius: `10px` (rounded-xl)

---

## 클래스 사용 규칙

### 하드코딩 금지 목록
다음은 사용하지 않음 (라이트/다크 모드 깨짐):

```
❌ bg-[#020202], bg-[#050505], bg-black, bg-black/90
❌ text-white, text-white/70, text-white/55
❌ border-white/5, border-white/10
❌ bg-white/5, bg-white/10
❌ fill="white" (SVG)
❌ prose-invert (단독 사용)
```

### 올바른 대체 패턴
```
✅ bg-background   (메인 캔버스)
✅ bg-card         (카드, 패널)
✅ bg-popover      (드롭다운, 커맨드 팔레트)
✅ bg-muted/30     (약한 구분 배경)
✅ bg-muted/50     (중간 구분 배경)
✅ text-foreground (기본 텍스트)
✅ text-foreground/70  (보조 텍스트)
✅ border-border   (경계선)
✅ fill="currentColor" (SVG)
✅ prose dark:prose-invert  (마크다운)
```

---

## 다국어 지원

- **한국어**: Pretendard Variable로 완전 지원
- **아랍어/RTL**: Vazirmatn + `.rtl-text` 클래스
- **UI 언어**: 한국어 기본 (컴포넌트 내 문자열 모두 한국어)

---

## 참고

- [Pretendard GitHub](https://github.com/orioncactus/pretendard)
- [Notion 색상 시스템](https://matthiasfrank.de/en/notion-colors/)
- [Notion 사이드바 UI 분석](https://medium.com/@quickmasum/ui-breakdown-of-notions-sidebar-2121364ec78d)
