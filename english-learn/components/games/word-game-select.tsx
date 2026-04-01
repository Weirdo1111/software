"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";

type Bank = {
  id: string;
  name: string;
};

const BANKS: Bank[] = [
  { id: "general", name: "General Academic" },
  { id: "cs", name: "Computer Science" },
  { id: "math", name: "Mathematics" },
  { id: "civil", name: "Civil Engineering" },
  { id: "mechanical", name: "Mechanical Engineering" },
  { id: "transport", name: "Transportation Engineering" },
];

function SectorIcon({ id }: { id: string }) {
  if (id === "general") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  if (id === "cs") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }

  if (id === "math") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  if (id === "civil") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M9 8h1" />
        <path d="M9 12h1" />
        <path d="M9 16h1" />
        <path d="M14 8h1" />
        <path d="M14 12h1" />
        <path d="M14 16h1" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      </svg>
    );
  }

  if (id === "mechanical") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function WordGameSelect({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState<string>("general");

  return (
    <div className="word-select-root" data-page="select">
      <main className="selection-page">
        <div className="mountains" />
        <div className="ground" />

        <section className="selection-shell">
          <div className="selection-inner">
            <h1 className="page-title">Select Defense Sector</h1>
            <div id="disciplineGrid" className="sector-grid">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  className={`sector-card${selectedBank === bank.id ? " active" : ""}`}
                  onClick={() => setSelectedBank(bank.id)}
                >
                  <span className="icon-box">
                    <SectorIcon id={bank.id} />
                  </span>
                  <div className="card-info">
                    <h3 className="card-title">{bank.name}</h3>
                  </div>
                </button>
              ))}
            </div>
            <div className="action-bar">
              <button id="backHome" className="action-button secondary-button" type="button" onClick={() => router.push(`/games/word-game?lang=${locale}`)}>
                Return
              </button>
              <button
                id="launch"
                className="action-button primary-button ready"
                type="button"
                onClick={() => router.push(`/games/word-game/battle?lang=${locale}&bank=${selectedBank}`)}
              >
                Access Sector
              </button>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .word-select-root {
          --sky-top: #7fd7e9;
          --sky-mid: #a6f0e4;
          --sky-bottom: #d4ffd8;
          --hill-far: #95d9c9;
          --hill-mid: #67bf90;
          --grass-light: #9dd860;
          --grass-mid: #74b54a;
          --grass-dark: #355a20;
          --stone-top: #d1c1a1;
          --stone-mid: #968a7a;
          --stone-dark: #584d4b;
          --wood-light: #d18d53;
          --wood-mid: #9a5737;
          --wood-dark: #64311f;
          --purple-main: #5c4192;
          --purple-dark: #2e194e;
          --purple-line: #241541;
          --purple-glow: #ecb8ff;
          --white: #fffef8;
          --cream: #fff1d3;
          --text-dark: #2f261e;
          margin: 0;
          min-height: 100vh;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          color: var(--white);
          background: radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.36), transparent 18%),
            linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-bottom) 100%);
        }

        .word-select-root * {
          box-sizing: border-box;
        }

        .selection-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selection-page::before {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 44%;
          background: linear-gradient(180deg, rgba(80, 135, 51, 0) 0%, rgba(80, 135, 51, 0.12) 100%);
          pointer-events: none;
        }

        .mountains {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 22%;
          height: 220px;
          pointer-events: none;
        }

        .mountains::before,
        .mountains::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 100%;
        }

        .mountains::before {
          clip-path: polygon(0% 100%, 11% 46%, 23% 100%, 37% 36%, 51% 100%, 66% 40%, 81% 100%, 100% 50%, 100% 100%);
          background: var(--hill-far);
          opacity: 0.92;
        }

        .mountains::after {
          transform: translateY(52px);
          clip-path: polygon(0% 100%, 10% 62%, 24% 100%, 40% 54%, 56% 100%, 74% 48%, 90% 100%, 100% 66%, 100% 100%);
          background: var(--hill-mid);
          opacity: 0.95;
        }

        .ground {
          position: absolute;
          left: -2%;
          right: -2%;
          bottom: -8%;
          height: 40%;
          background: radial-gradient(circle at 18% 12%, rgba(194, 240, 103, 0.8), rgba(194, 240, 103, 0) 18%),
            radial-gradient(circle at 80% 18%, rgba(194, 240, 103, 0.5), rgba(194, 240, 103, 0) 16%),
            linear-gradient(180deg, var(--grass-light) 0%, var(--grass-mid) 50%, var(--grass-dark) 100%);
          clip-path: polygon(0 42%, 12% 28%, 23% 26%, 38% 34%, 50% 31%, 60% 24%, 72% 28%, 82% 18%, 100% 26%, 100% 100%, 0 100%);
          box-shadow: inset 0 10px 0 rgba(255, 255, 255, 0.15);
          pointer-events: none;
        }

        .selection-shell {
          position: relative;
          z-index: 1;
          width: min(1320px, 100%);
          padding: 28px;
          border-radius: 34px;
          background: rgba(50, 39, 88, 0.22);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16), 0 24px 50px rgba(33, 24, 64, 0.22);
          backdrop-filter: blur(10px);
        }

        .selection-inner {
          padding: 26px 26px 24px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.16), rgba(48, 31, 83, 0.08));
        }

        .page-title {
          margin: 0 0 28px;
          text-align: center;
          font-size: clamp(2.8rem, 5vw, 5rem);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cream);
          text-shadow: 0 4px 0 rgba(55, 33, 24, 0.18), 0 18px 30px rgba(33, 22, 25, 0.16);
        }

        .sector-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .sector-card {
          min-height: 152px;
          padding: 22px 24px;
          border-radius: 24px;
          border: 3px solid var(--purple-line);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 8px 0 rgba(36, 21, 65, 0.34);
          display: flex;
          align-items: center;
          gap: 18px;
          color: var(--cream);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }

        .sector-card:hover {
          transform: translateY(-4px);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.16), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 12px 0 rgba(36, 21, 65, 0.34);
        }

        .sector-card.active {
          background: linear-gradient(180deg, #d7c8ab 0%, #9e8f7f 100%);
          border-color: #4f4540;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.28), inset 0 -8px 0 rgba(63, 51, 47, 0.24), 0 10px 0 rgba(79, 66, 58, 0.3);
          color: var(--text-dark);
        }

        .icon-box {
          width: 66px;
          height: 66px;
          border-radius: 18px;
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          border: 2px solid rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.08);
          color: #f0c4ff;
        }

        .sector-card.active .icon-box {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(79, 69, 64, 0.18);
          color: #6d4cab;
        }

        .icon-box svg {
          width: 32px;
          height: 32px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .card-info {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .card-title {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.35;
          font-weight: 800;
          letter-spacing: 0.01em;
        }

        .action-bar {
          display: flex;
          justify-content: center;
          gap: 18px;
          margin-top: 28px;
        }

        .action-button {
          border: none;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 16px;
          padding: 16px 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
        }

        .secondary-button {
          min-width: 170px;
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          color: var(--cream);
          border: 3px solid var(--purple-line);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 6px 0 rgba(36, 21, 65, 0.34);
        }

        .primary-button {
          min-width: 320px;
          background: linear-gradient(180deg, #d97d54, #a84e30);
          color: var(--white);
          border: 3px solid #6f2d1e;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.18), inset 0 -5px 0 rgba(109, 41, 25, 0.36), 0 6px 0 rgba(109, 41, 25, 0.38);
        }

        @media (max-width: 980px) {
          .selection-page {
            padding: 18px;
            display: block;
          }

          .selection-shell {
            margin: 0 auto;
            padding: 18px;
          }

          .selection-inner {
            padding: 22px 20px 20px;
          }

          .sector-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .sector-grid {
            grid-template-columns: 1fr;
          }

          .action-bar {
            flex-direction: column;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

