"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, Sparkles, X } from "lucide-react"
import type { GhostNote } from "@/lib/types"

interface GhostPanelProps {
  ghostNotes: GhostNote[]
  isOpen: boolean
  onClose: () => void
  onClaim: (id: string) => void
  onDismiss: (id: string) => void
}

export function GhostPanel({ ghostNotes, isOpen, onClose, onClaim, onDismiss }: GhostPanelProps) {
  return (
    <div
      style={{
        width: isOpen ? 272 : 0,
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? "visible" : "hidden",
      }}
      className="flex flex-col h-full bg-sidebar backdrop-blur-3xl border-l border-border shrink-0 overflow-hidden relative z-50 transition-all duration-200 ease-in-out"
    >
      <div className="w-[272px] flex flex-col h-full">
        {/* Header */}
        <div className="flex h-10 items-center justify-between border-b border-border bg-card/80 px-3 py-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-5 w-5 bg-primary/10 rounded-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-tight text-foreground/80 select-none">
              합성
            </h3>
            {ghostNotes.length > 0 && (
              <span className="font-mono text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm font-bold tabular-nums">
                {ghostNotes.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-muted rounded-sm transition-colors text-muted-foreground/50 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-3">
          {ghostNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3 opacity-25">
              <Sparkles className="h-5 w-5" />
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-center leading-relaxed">
                창발적 논제가<br />여기에 나타납니다
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {ghostNotes.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col gap-3"
                >
                  {/* Row: sparkles + category + dismiss */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary/50 shrink-0" />
                      {note.category && !note.isGenerating && (
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
                          {note.category}
                        </span>
                      )}
                    </div>
                    {!note.isGenerating && (
                      <button
                        onClick={() => onDismiss(note.id)}
                        className="h-5 w-5 flex items-center justify-center rounded-sm text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Text / loading */}
                  {note.isGenerating ? (
                    <div className="flex items-center gap-2.5 py-1">
                      <div className="flex space-x-1">
                        <div className="h-1 w-1 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]" />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]" />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-primary/40" />
                      </div>
                      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/50">
                        합성 중...
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium leading-relaxed text-foreground/80">
                      {note.text}
                    </p>
                  )}

                  {/* Add button */}
                  {!note.isGenerating && (
                    <button
                      onClick={() => onClaim(note.id)}
                      className="flex items-center gap-1.5 w-full justify-center rounded-md bg-primary/15 hover:bg-primary/25 px-2.5 py-1.5 font-sans text-xs font-bold uppercase tracking-wider text-primary transition-colors"
                    >
                      <Check className="h-3 w-3 stroke-[3px]" />
                      캔버스에 추가
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-3 py-2 shrink-0">
          <p className="font-sans text-xs text-muted-foreground/40 text-center">
            작성 패턴에서 생성됨
          </p>
        </div>
      </div>
    </div>
  )
}
