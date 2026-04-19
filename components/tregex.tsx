"use client";
/*fix hisotry bar for mobile*/
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { X } from "lucide-react";
import { createMatcher } from "@/lib/regex";
import { logout } from "@/app/actions/auth";
import { HistoryEntry, ResultBanner } from "@/lib/definitions";
import { formatDate } from "@/lib/formatdate";



export default function TregexPage({
  isLoggedIn = false,
  username = null,
}: {
  isLoggedIn?: boolean;
  username?: string | null;
}) {

  const [regexStr, setRegexStr] = useState("");
  const [textStr, setTextStr] = useState("");

  const matcherRef = useRef<((w: string) => boolean) | null>(null);
  const lastRegexRef = useRef<string>("");

  const [result, setResult] = useState<{ matched: boolean } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);




  useEffect(() => {
    if (!isLoggedIn) return;
    setHistoryLoading(true);
    fetch("/api/history")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => Array.isArray(data) && setHistory(data))
      .finally(() => setHistoryLoading(false));
  }, [isLoggedIn]);



  const addBanner = useCallback((matched: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setResult({ matched });
    timerRef.current = setTimeout(() => setResult(null), 10_000);
  }, []);


  const handleTest = useCallback(async () => {
    if (!regexStr.trim() || !textStr.trim()) return;

    if (regexStr !== lastRegexRef.current || !matcherRef.current) {
      try {
        matcherRef.current = createMatcher(regexStr);
        lastRegexRef.current = regexStr;
      } catch {
        addBanner(false);
        return;
      }

      if (isLoggedIn) {
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regex: regexStr }),
        })
          .then((r) => r.json())
          .then((entry) => {
            if (entry?.id) setHistory((prev) => [entry, ...prev]);
          })
          .catch(() => { });
      }
    }

    const matched = matcherRef.current!(textStr);
    addBanner(matched);
  }, [regexStr, textStr, isLoggedIn, addBanner]);





  const deleteEntry = useCallback(async (id: number) => {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);



  return (
    <div className="flex flex-col min-h-screen bg-background font-mono">
      {/*navbar*/}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border">
        <div className="flex items-center gap-5">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                login
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                register
              </Link>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Welcome: {username}</span>
          )}
        </div>

        {isLoggedIn && (
          <form action={logout}>
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              logout
            </button>
          </form>
        )}
      </header>


      {/* Page*/}
      <div className="flex flex-1 overflow-hidden">
        {/* Main*/}
        <main className="flex-1 flex flex-col items-center px-6 py-12 border-r border-border overflow-y-auto">
          {/* Title */}
          <div className="text-center mb-10 max-w-md">
            <h1 className="text-2xl font-medium tracking-tight mb-1.5">
              <span className="text-foreground">TR</span>
              <span className="text-muted-foreground">egex</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An implementation of thompson's construction. converts your
              regular expression into an nfa and simulates it to find matches.
            </p>
          </div>


          {/* add fake "/ /" to prettify the regexes */}
          {/*Inputs*/}
          <div className="w-full max-w-lg flex flex-col gap-3">
            <div>
              <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-1.5">
                regex
              </p>
              <Input
                className="font-mono text-sm"
                placeholder="(a|b)*abb"
                value={regexStr}
                onChange={(e) => setRegexStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTest()}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div>
              <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-1.5">
                test string
              </p>
              <Input
                className="font-mono text-sm"
                placeholder="aabb"
                value={textStr}
                onChange={(e) => setTextStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTest()}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <Button
              variant="secondary"
              className="w-full font-mono text-sm"
              onClick={handleTest}
              disabled={!regexStr.trim() || !textStr.trim()}
            >
              test
              <kbd className="ml-2 text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                /
              </kbd>
            </Button>


            {/*Result*/}
            {result && (
              <div className={`flex items-center justify-between text-sm px-3 py-2 rounded-md border font-mono ${result.matched
                ? "border-green-600/40 bg-green-950/30 text-green-400"
                : "border-red-600/40 bg-red-950/30 text-red-400"
                }`}>
                <span>
                  {result.matched
                    ? "match — the string satisfies the regex."
                    : "no match — the string does not satisfy the regex."}
                </span>
                <button onClick={() => setResult(null)} className="ml-3 opacity-60 hover:opacity-100 transition-opacity">
                  <X size={13} />
                </button>
              </div>
            )}

          </div>
        </main>

        {/*Sidebar*/}
        <aside className="w-56 flex flex-col p-4 shrink-0">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <p className="text-[11px] tracking-widest uppercase text-muted-foreground mb-3 w-fit border-b border-dashed border-muted-foreground/40 pb-0.5 cursor-default select-none">
                history
              </p>
            </HoverCardTrigger>
            {!isLoggedIn && (
              <HoverCardContent className="w-52 font-mono text-xs text-muted-foreground leading-relaxed">
                <Link href="/login" className="text-foreground underline underline-offset-2 hover:no-underline">
                  log in
                </Link>{" "}
                to save your regex history across sessions.
              </HoverCardContent>
            )}
          </HoverCard>


          {/* fix deleting also changes regex */}

          <ScrollArea className="flex-1 max-h-200">
            {!isLoggedIn ? (
              <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
                <Link href="/login" className="text-foreground underline underline-offset-2 hover:no-underline">
                  log in
                </Link>{" "}
                to track your regex history.
              </p>
            ) : historyLoading ? (
              <p className="text-xs text-muted-foreground text-center pt-2">
                loading...
              </p>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
                no history yet.
                <br />
                run a test to begin.
              </p>
            ) : (

              <div className="flex flex-col gap-1">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="group flex items-start justify-between gap-1 px-2 py-1.5 rounded-md border border-transparent hover:bg-muted hover:border-border transition-colors"
                    onClick={() => setRegexStr(entry.regex)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        /{entry.regex}/
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}