"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { RecoveryWord } from "@/lib/games/word-game-recovery";
import type { Locale } from "@/lib/i18n/dictionaries";

type RecoverySource = "critical" | "victory";

const FALLBACK_QUEUE: RecoveryWord[] = [
  {
    word: "corridor",
    meaningEn: "Corridor",
    meaningZh: "交通走廊",
    examples: [{ en: "The corridor carries peak traffic.", zh: "交通走廊在高峰期承载大量流量。" }],
    uk: "UK /corridor/",
    us: "US /corridor/",
  },
];

function buildRecoveryExamples(item: RecoveryWord) {
  const rows = item.examples
    .map((example) => ({
      en: (example.en || "").trim(),
      zh: (example.zh || "").trim(),
    }))
    .filter((example) => example.en.length > 0 || example.zh.length > 0)
    .map((example) => ({
      en: example.en || `The term "${item.word}" appears in many academic contexts.`,
      zh: example.zh || `"${item.word}" 在学术语境中较常见。`,
    }));

  if (rows.length > 0) return rows;

  return [
    {
      en: `The term "${item.word}" appears in many academic contexts.`,
      zh: `"${item.word}" 在学术语境中较常见。`,
    },
  ];
}

export function WordGameRecovery({ locale, bank, initialQueue, source }: { locale: Locale; bank: string; initialQueue: RecoveryWord[]; source: RecoverySource }) {
  const router = useRouter();
  const queue = initialQueue.length > 0 ? initialQueue : FALLBACK_QUEUE;
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const word = queue[Math.min(index, Math.max(queue.length - 1, 0))];

  const meaningText = useMemo(() => {
    if (!word) return "";
    return word.meaningZh.trim() || word.meaningEn.trim();
  }, [word]);

  const exampleRows = useMemo(() => {
    if (!word) return [];
    return buildRecoveryExamples(word);
  }, [word]);

  const feedback = done ? "All corrupted units reviewed." : "Review this word and continue.";

  const nextWord = useCallback(() => {
    setIndex((prev) => {
      const next = prev + 1;
      if (next >= queue.length) {
        setDone(true);
        return prev;
      }
      return next;
    });
  }, [queue.length]);

  const returnToBattle = useCallback(() => {
    if (source === "victory") {
      router.push(`/games/word-game?lang=${locale}`);
      return;
    }
    router.push(`/games/word-game/battle?lang=${locale}&bank=${bank}&resume=1`);
  }, [bank, locale, router, source]);

  const speak = useCallback((text: string, lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="word-recovery-root" data-page="recovery">
      <main className="stage">
        <section className={`review-card ${done ? "is-done" : ""}`}>
          <div className="content">
            <div className="top-row">
              <div>WORD REVIEW</div>
              <div id="rProg">{`${Math.min(index + 1, Math.max(queue.length, 1))}/${Math.max(queue.length, 1)}`}</div>
            </div>

            <h1 id="rWord" className="word-title">
              {done ? "Shield Restored" : word?.word ?? "ability"}
            </h1>

            {!done ? (
              <div id="reviewBody">
                <div className="pron-row">
                  <div className="pron-item">
                    <button id="speakUk" className="speak-btn" type="button" aria-label="Play UK pronunciation" onClick={() => speak(word?.word ?? "ability", "en-GB")}>
                      {"\u25B6"}
                    </button>
                    <span id="rPronUk">{word?.uk ?? "UK /ability/"}</span>
                  </div>
                  <div className="pron-item">
                    <button id="speakUs" className="speak-btn" type="button" aria-label="Play US pronunciation" onClick={() => speak(word?.word ?? "ability", "en-US")}>
                      {"\u25B6"}
                    </button>
                    <span id="rPronUs">{word?.us ?? "US /ability/"}</span>
                  </div>
                </div>

                <section className="section">
                  <h3>Meaning</h3>
                  <div id="rZh">{meaningText || "能力；本领"}</div>
                </section>

                <section className="section">
                  <h3>Examples</h3>
                  <div id="rExamples">
                    {exampleRows.map((row, idx) => (
                      <div key={`${row.en}-${row.zh}-${idx}`} className="ex-item">
                        <p className="ex-en">{row.en}</p>
                        <p className="ex-zh">{row.zh}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="actions" id="reviewActions">
                  <button id="rNext" type="button" onClick={nextWord}>
                    {index >= queue.length - 1 ? "Complete Recovery" : "Next Word"}
                  </button>
                </div>
              </div>
            ) : null}

            <div id="rFeedback" className={done ? "ok" : "warn"}>
              {feedback}
            </div>

            {done ? (
              <div id="rDone">
                <h3>Recovery Complete</h3>
                <p>All missed words reviewed. Shield is restored and ready for battle.</p>
                <button id="returnBattle" type="button" onClick={returnToBattle}>
                  {source === "victory" ? "Return Home" : "Return to Defense"}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --sky-top: #7fd7e9;
          --sky-mid: #a6f0e4;
          --sky-bottom: #dff7fb;
          --paper: #f9f4e8;
          --paper-line: #e2d7c1;
          --ink: #3b2f26;
          --olive: #9aaf2e;
          --olive-dark: #7f9125;
          --orange-top: #d97d54;
          --orange-bottom: #a84e30;
          --white: #fffef8;
          --ok: #2d7a28;
          --warn: #8f5c14;
        }
        .word-recovery-root * { box-sizing: border-box; }
        .word-recovery-root {
          min-height: 100vh;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          color: var(--ink);
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.5), transparent 24%),
            linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-bottom) 100%);
        }
        .word-recovery-root .stage {
          width: min(1220px, calc(100vw - 28px));
          min-height: calc(100vh - 22px);
          margin: 11px auto;
          padding: 12px;
          border-radius: 30px;
          background: rgba(106, 159, 187, 0.24);
          box-shadow:
            inset 0 0 0 2px rgba(255, 255, 255, 0.24),
            0 16px 30px rgba(24, 67, 93, 0.18);
        }
        .word-recovery-root .review-card {
          height: calc(100vh - 46px);
          border-radius: 26px;
          padding: 24px 26px 20px;
          background: var(--paper);
          border: 2px solid var(--paper-line);
          box-shadow:
            inset 0 2px 0 rgba(255, 255, 255, 0.85),
            0 8px 24px rgba(58, 84, 30, 0.1);
          overflow: auto;
        }
        .word-recovery-root .content {
          max-width: 820px;
          margin: 16px auto 0;
          display: grid;
          gap: 16px;
        }
        .word-recovery-root .review-card.is-done .content {
          min-height: calc(100vh - 190px);
          align-content: center;
          justify-content: center;
          text-align: center;
        }
        .word-recovery-root .review-card.is-done .top-row {
          display: none;
        }
        .word-recovery-root .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #8f9276;
          font-size: 1.05rem;
          letter-spacing: 0.06em;
        }
        .word-recovery-root .word-title {
          margin: 8px 0 0;
          text-align: center;
          font-size: clamp(3.2rem, 9vw, 5.8rem);
          line-height: 1;
          font-weight: 900;
          color: var(--olive);
          text-transform: lowercase;
        }
        .word-recovery-root .pron-row {
          display: flex;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .word-recovery-root .pron-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          color: #6f695f;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(140, 131, 119, 0.18);
          border-radius: 14px;
          min-height: 34px;
          padding: 4px 10px 4px 6px;
        }
        .word-recovery-root .speak-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: var(--olive);
          color: var(--white);
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 -2px 0 rgba(52, 67, 14, 0.28);
        }
        .word-recovery-root .speak-btn:hover {
          background: var(--olive-dark);
        }
        .word-recovery-root .section {
          margin-top: 4px;
        }
        .word-recovery-root .section + .section {
          margin-top: 30px;
        }
        .word-recovery-root .section h3 {
          margin: 0 0 8px;
          color: #4a4037;
          font-size: 1.55rem;
          font-weight: 900;
        }
        .word-recovery-root #rZh,
        .word-recovery-root #rExamples {
          border-radius: 14px;
          background: #fff;
          border: 1px solid rgba(140, 131, 119, 0.2);
          padding: 14px 16px;
        }
        .word-recovery-root #rZh {
          min-height: 56px;
          font-size: 1.15rem;
          line-height: 1.6;
          color: #3f332a;
        }
        .word-recovery-root #rExamples {
          display: grid;
          gap: 16px;
          min-height: 140px;
        }
        .word-recovery-root .ex-item {
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(150, 140, 126, 0.4);
        }
        .word-recovery-root .ex-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .word-recovery-root .ex-en {
          margin: 0;
          font-size: 1.2rem;
          line-height: 1.55;
          color: #2f2721;
        }
        .word-recovery-root .ex-zh {
          margin: 4px 0 0;
          font-size: 1.1rem;
          line-height: 1.55;
          color: #7a736b;
        }
        .word-recovery-root .actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 68px;
        }
        .word-recovery-root #rNext,
        .word-recovery-root #returnBattle {
          height: 52px;
          min-width: 210px;
          border-radius: 15px;
          border: 3px solid #6f2d1e;
          background: linear-gradient(180deg, var(--orange-top), var(--orange-bottom));
          color: var(--white);
          font: inherit;
          font-size: 0.98rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow:
            inset 0 2px 0 rgba(255, 255, 255, 0.2),
            inset 0 -4px 0 rgba(109, 41, 25, 0.35),
            0 5px 0 rgba(109, 41, 25, 0.35);
        }
        .word-recovery-root #rFeedback {
          min-height: 22px;
          text-align: center;
          color: #7d7468;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .word-recovery-root #rFeedback.ok {
          color: var(--ok);
        }
        .word-recovery-root #rFeedback.warn {
          color: var(--warn);
        }
        .word-recovery-root #rDone {
          text-align: center;
          margin-top: 4px;
        }
        .word-recovery-root #rDone h3 {
          margin: 0 0 8px;
          color: var(--ok);
          font-size: 1.8rem;
        }
        .word-recovery-root #rDone p {
          margin: 0 0 14px;
          color: #726758;
          line-height: 1.6;
        }
        @media (max-width: 860px) {
          .word-recovery-root {
            overflow: auto;
          }
          .word-recovery-root .stage {
            width: calc(100vw - 12px);
            min-height: auto;
            margin: 6px auto;
            padding: 6px;
            border-radius: 16px;
          }
          .word-recovery-root .review-card {
            height: auto;
            min-height: calc(100vh - 24px);
            padding: 16px 14px;
          }
          .word-recovery-root .content {
            margin-top: 8px;
            gap: 12px;
          }
          .word-recovery-root .review-card.is-done .content {
            min-height: calc(100vh - 140px);
          }
          .word-recovery-root .section h3 {
            font-size: 1.32rem;
          }
          .word-recovery-root .section + .section {
            margin-top: 22px;
          }
          .word-recovery-root .actions {
            flex-direction: column;
          }
          .word-recovery-root #rNext,
          .word-recovery-root #returnBattle {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
