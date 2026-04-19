"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
  value: string;
  index: number;
}

interface HistoryEntry {
  pattern: string;
  flags: string;
  matchCount: number;
  isError: boolean;
  time: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHighlight(str: string, matches: Match[]): string {
  let result = "";
  let last = 0;
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  for (const m of sorted) {
    result += escapeHtml(str.slice(last, m.index));
    result += `<mark class="regex-match">${escapeHtml(m.value)}</mark>`;
    last = m.index + m.value.length;
  }
  result += escapeHtml(str.slice(last));
  return result;
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Flag Toggle ──────────────────────────────────────────────────────────────

function FlagToggle({
  flag,
  label,
  active,
  onToggle,
}: {
  flag: string;
  label: string;
  active: boolean;
  onToggle: (flag: string) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={() => onToggle(flag)}
      className={`px-1.5 text-xs font-mono transition-colors select-none ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {flag}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegexLabPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [activeFlags, setActiveFlags] = useState<Set<string>>(new Set(["g"]));
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const flags = [...activeFlags].join("");

  const toggleFlag = useCallback((flag: string) => {
    setActiveFlags((prev) => {
      const next = new Set(prev);
      next.has(flag) ? next.delete(flag) : next.add(flag);
      return next;
    });
  }, []);

  const runTest = useCallback(() => {
    if (!pattern.trim()) return;
    setHasRun(true);
    setErrorMsg(null);

    let regex: RegExp;
    let found: Match[] = [];
    let isError = false;

    try {
      regex = new RegExp(pattern, flags);
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(testString)) !== null) {
          found.push({ value: m[0], index: m.index });
          if (m[0].length === 0) regex.lastIndex++;
        }
      } else {
        const m = regex.exec(testString);
        if (m) found.push({ value: m[0], index: m.index });
      }
      setMatches(found);
      setHighlighted(
        found.length > 0 ? buildHighlight(testString, found) : null
      );
    } catch (e) {
      isError = true;
      setErrorMsg((e as Error).message);
      setMatches([]);
      setHighlighted(null);
    }

    setHistory((prev) => [
      {
        pattern,
        flags,
        matchCount: found.length,
        isError,
        time: new Date(),
      },
      ...prev.slice(0, 49),
    ]);
  }, [pattern, testString, flags]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") runTest();
    },
    [runTest]
  );

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setPattern(entry.pattern);
  }, []);

  return (
    <>
      {/* Inject match highlight style */}
      <style>{`
        .regex-match {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          border-radius: 3px;
          padding: 0 2px;
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-background font-mono">
        {/* ── Top bar ── */}
        <header className="flex  items-center px-6 py-3.5 border-b border-border gap-5">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            login
          </Link>
          <span className="text-border text-sm">·</span>
          <Link
            href="/register"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            register
          </Link>
        </header>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Main ── */}
          <main className="flex-1 flex flex-col items-center px-6 py-12 border-r border-border overflow-y-auto">
            {/* Hero */}
            <div className="text-center mb-10 max-w-md">
              <h1 className="text-2xl font-medium tracking-tight mb-1.5">
                /{" "}
                <span className="text-foreground">regex</span>
                <span className="text-muted-foreground">lab</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                test regular expressions against any string in real time.
                every match is highlighted instantly as it's found.
              </p>
            </div>

            {/* Input group */}
            <div className="w-full max-w-lg flex flex-col gap-3">
              {/* Regex input */}
              <div>
                <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-1.5">
                  pattern
                </p>
                <div className="flex items-center border border-input rounded-md bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
                  <span className="px-3 text-lg text-muted-foreground border-r border-border select-none leading-none py-2">
                    /
                  </span>
                  <input
                    className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none px-3 py-2 placeholder:text-muted-foreground/50"
                    placeholder="[a-z]+\d{2,}"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {/* Flag toggles */}
                  <div className="flex items-center border-l border-border px-2 gap-0.5">
                    <FlagToggle
                      flag="g"
                      label="global"
                      active={activeFlags.has("g")}
                      onToggle={toggleFlag}
                    />
                    <FlagToggle
                      flag="i"
                      label="case insensitive"
                      active={activeFlags.has("i")}
                      onToggle={toggleFlag}
                    />
                    <FlagToggle
                      flag="m"
                      label="multiline"
                      active={activeFlags.has("m")}
                      onToggle={toggleFlag}
                    />
                  </div>
                  <span className="px-3 text-lg text-muted-foreground border-l border-border select-none leading-none py-2">
                    /
                  </span>
                </div>
              </div>

              {/* String input */}
              <div>
                <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-1.5">
                  test string
                </p>
                <Input
                  className="font-mono text-sm"
                  placeholder="paste your test string here..."
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Run button */}
              <Button
                variant="secondary"
                className="w-full font-mono text-sm tracking-wide"
                onClick={runTest}
              >
                run test
                <kbd className="ml-2 text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                  ↵
                </kbd>
              </Button>

              {/* Highlighted string */}
              {testString && (
                <div
                  className="text-sm font-mono leading-loose break-all text-foreground min-h-6 mt-1"
                  dangerouslySetInnerHTML={{
                    __html: highlighted ?? escapeHtml(testString),
                  }}
                />
              )}

              {/* Results */}
              {hasRun && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] tracking-widest uppercase text-muted-foreground">
                      matches
                    </p>
                    {!errorMsg && matches !== null && (
                      <span className="text-xs text-muted-foreground">
                        {matches.length}{" "}
                        {matches.length === 1 ? "match" : "matches"}
                      </span>
                    )}
                  </div>

                  {errorMsg ? (
                    <p className="text-sm text-destructive font-mono">
                      {errorMsg}
                    </p>
                  ) : matches && matches.length === 0 ? (
                    <Badge
                      variant="outline"
                      className="font-mono text-muted-foreground border-dashed"
                    >
                      no matches found
                    </Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {matches?.map((m, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="font-mono text-xs px-2.5 py-1"
                        >
                          {m.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* ── Sidebar ── */}
          <aside className="w-56 flex flex-col p-4 shrink-0">
            {/* History title with hover card */}
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3 w-fit border-b border-dashed border-muted-foreground/40 pb-0.5 cursor-default select-none">
                  history
                </p>
              </HoverCardTrigger>
              <HoverCardContent className="w-52 font-mono text-xs text-muted-foreground leading-relaxed">
                <Link
                  href="/login"
                  className="text-foreground underline underline-offset-2 hover:no-underline"
                >
                  log in
                </Link>{" "}
                to save your regex history across sessions.
              </HoverCardContent>
            </HoverCard>

            {/* Scroll area */}
            <ScrollArea className="flex-1">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
                  no history yet.
                  <br />
                  run a test to begin.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {history.map((entry, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => loadFromHistory(entry)}
                      className="text-left px-2 py-1.5 rounded-md border border-transparent hover:bg-muted hover:border-border transition-colors group w-full"
                    >
                      <p className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        /{entry.pattern}/
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {entry.isError
                          ? "error"
                          : `${entry.matchCount} match${
                              entry.matchCount !== 1 ? "es" : ""
                            }`}{" "}
                        · {timeAgo(entry.time)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </aside>
        </div>
      </div>
    </>
  );
}