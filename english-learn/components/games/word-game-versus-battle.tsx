"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/i18n/dictionaries";

const MAX_HP = 5;
const TOTAL_WAVES = 8;

const BANK_LABELS: Record<string, string> = {
  general: "General Academic",
  cs: "Computer Science",
  math: "Mathematics",
  civil: "Civil Engineering",
  mechanical: "Mechanical Engineering",
  transport: "Transportation Engineering",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function WordGameVersusBattle({
  locale,
  bank,
  room,
}: {
  locale: Locale;
  bank: string;
  room: string;
}) {
  const router = useRouter();
  const [wave] = useState(1);
  const [timer, setTimer] = useState(90);
  const [youHp] = useState(MAX_HP);
  const [rivalHp] = useState(MAX_HP);
  const [youScore] = useState(0);
  const [rivalScore] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = window.setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const bankLabel = BANK_LABELS[bank] ?? BANK_LABELS.general;
  const yourHpPercent = (youHp / MAX_HP) * 100;
  const rivalHpPercent = (rivalHp / MAX_HP) * 100;
  const duelProgress = clamp((youScore + rivalScore) / 100, 0, 100);

  return (
    <div className="word-versus-root" data-page="versus-battle">
      <main className="versus-shell">
        <section className="top-row">
          <button className="return-btn" type="button" onClick={() => router.push(`/games/word-game/multiplayer?lang=${locale}`)}>
            Return To Lobby
          </button>
          <div className="meta-card">
            <span>Room</span>
            <strong>{room}</strong>
          </div>
          <div className="meta-card">
            <span>Sector</span>
            <strong>{bankLabel}</strong>
          </div>
          <div className="meta-card">
            <span>Wave</span>
            <strong>
              {Math.min(wave, TOTAL_WAVES)}/{TOTAL_WAVES}
            </strong>
          </div>
          <div className="meta-card">
            <span>Timer</span>
            <strong>{timer}s</strong>
          </div>
        </section>

        <section className="duel-strip">
          <article className="player-card you">
            <div className="name-row">
              <span className="tag">You</span>
              <strong>Player A</strong>
            </div>
            <div className="hp-track">
              <div className="hp-fill you-fill" style={{ width: `${yourHpPercent}%` }} />
            </div>
            <div className="stats-row">
              <span>HP {youHp}/5</span>
              <span>Score {youScore}</span>
            </div>
          </article>

          <div className="versus-badge">VS</div>

          <article className="player-card rival">
            <div className="name-row">
              <span className="tag">Opponent</span>
              <strong>Player B</strong>
            </div>
            <div className="hp-track">
              <div className="hp-fill rival-fill" style={{ width: `${rivalHpPercent}%` }} />
            </div>
            <div className="stats-row">
              <span>HP {rivalHp}/5</span>
              <span>Score {rivalScore}</span>
            </div>
          </article>
        </section>

        <section className="arena-wrap">
          <div className="sky-layer" />
          <div className="mountains" />
          <div className="ground" />

          <div className="arena-content">
            <div className="tower left-tower">
              <span className="tower-label">Your Core</span>
            </div>
            <div className="question-banner">
              <span className="mode-chip">VERSUS SPELLING</span>
              <h2>Algorithm</h2>
              <p>Type the full word faster than your opponent to deal damage.</p>
              <div className="option-grid">
                <span>1. Algorithm</span>
                <span>2. Interface</span>
                <span>3. Recursion</span>
              </div>
            </div>
            <div className="tower right-tower">
              <span className="tower-label">Rival Core</span>
            </div>
          </div>

          <div className="duel-progress">
            <span>Duel Momentum</span>
            <div className="momentum-track">
              <div className="momentum-fill" style={{ width: `${duelProgress}%` }} />
            </div>
          </div>
        </section>

        <section className="bottom-row">
          <article className="command-panel">
            <h3>Your Answer Panel</h3>
            <div className="input-shell">Type answer here...</div>
            <button type="button" className="attack-btn">
              Attack
            </button>
          </article>
        </section>
      </main>

      <style jsx global>{`
        .word-versus-root {
          --sky-top: #7fd7e9;
          --sky-mid: #a6f0e4;
          --sky-bottom: #d4ffd8;
          --hill-far: #95d9c9;
          --hill-mid: #67bf90;
          --grass-light: #9dd860;
          --grass-mid: #74b54a;
          --grass-dark: #355a20;
          --purple-line: #241541;
          --white: #fffef8;
          --cream: #fff1d3;
          min-height: 100vh;
          margin: 0;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          color: var(--white);
          background: radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.36), transparent 18%),
            linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-bottom) 100%);
          padding: 12px;
        }

        .word-versus-root * {
          box-sizing: border-box;
        }

        .versus-shell {
          width: min(1380px, 100%);
          min-height: calc(100vh - 24px);
          margin: 0 auto;
          padding: 12px;
          border-radius: 30px;
          background: rgba(50, 39, 88, 0.24);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16), 0 24px 50px rgba(33, 24, 64, 0.22);
          backdrop-filter: blur(10px);
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          gap: 12px;
        }

        .top-row {
          display: grid;
          grid-template-columns: 1.2fr repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .return-btn,
        .meta-card {
          border-radius: 16px;
          border: 3px solid var(--purple-line);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3);
          min-height: 68px;
          padding: 10px 14px;
        }

        .return-btn {
          cursor: pointer;
          color: var(--cream);
          font: inherit;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .meta-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .meta-card span {
          color: rgba(255, 248, 235, 0.74);
          font-size: 0.74rem;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .meta-card strong {
          margin-top: 4px;
          font-size: 1.05rem;
          color: #fff7e2;
        }

        .duel-strip {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
        }

        .player-card {
          border-radius: 18px;
          border: 3px solid var(--purple-line);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3);
          padding: 12px 14px;
        }

        .name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .tag {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          background: rgba(18, 14, 41, 0.44);
          padding: 3px 8px;
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 248, 235, 0.86);
          font-weight: 800;
        }

        .name-row strong {
          color: #fff7e2;
          font-size: 1rem;
        }

        .hp-track {
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(15, 11, 31, 0.5);
        }

        .hp-fill {
          height: 100%;
          border-radius: inherit;
          transition: width 0.2s ease;
        }

        .you-fill {
          background: linear-gradient(90deg, #7ce46d, #40b757);
        }

        .rival-fill {
          background: linear-gradient(90deg, #ff8a75, #e45a56);
        }

        .stats-row {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255, 248, 235, 0.84);
          font-size: 0.86rem;
          font-weight: 700;
        }

        .versus-badge {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          border: 3px solid #333e96;
          background: linear-gradient(180deg, #6f83f7, #4f5fd0);
          color: #fffef8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          letter-spacing: 0.1em;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -4px 0 rgba(39, 49, 125, 0.3);
        }

        .arena-wrap {
          position: relative;
          border-radius: 24px;
          border: 4px solid rgba(58, 42, 104, 0.76);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.12);
          overflow: hidden;
          min-height: 320px;
          background: linear-gradient(180deg, rgba(188, 252, 255, 0.28), rgba(90, 141, 202, 0.05) 40%, rgba(0, 0, 0, 0) 41%),
            linear-gradient(180deg, rgba(98, 126, 220, 0.22), rgba(38, 42, 113, 0.06));
        }

        .sky-layer {
          position: absolute;
          inset: 0 0 42% 0;
          background: radial-gradient(circle at 52% 20%, rgba(255, 255, 255, 0.6), transparent 12%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0));
        }

        .mountains {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 28%;
          height: 190px;
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
        }

        .arena-content {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: 180px 1fr 180px;
          align-items: center;
          gap: 14px;
          padding: 22px;
        }

        .tower {
          height: 150px;
          border-radius: 18px;
          border: 4px solid #4f4540;
          background: linear-gradient(180deg, #d7c8ab 0%, #9e8f7f 100%);
          box-shadow: inset 0 -10px 0 rgba(63, 51, 47, 0.24);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 10px;
        }

        .tower-label {
          border-radius: 999px;
          border: 2px solid rgba(79, 69, 64, 0.35);
          background: rgba(255, 255, 255, 0.3);
          color: #2f261e;
          padding: 4px 9px;
          font-size: 0.76rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .question-banner {
          border-radius: 22px;
          border: 4px solid #27163f;
          background: linear-gradient(180deg, rgba(57, 38, 91, 0.96), rgba(36, 21, 63, 0.98));
          box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.1), 0 10px 0 rgba(43, 25, 66, 0.38);
          padding: 14px 16px;
          min-height: 170px;
        }

        .mode-chip {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(240, 203, 105, 0.16);
          border: 2px solid rgba(240, 203, 105, 0.18);
          color: #f5cd69;
          font-size: 0.76rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .question-banner h2 {
          margin: 10px 0 8px;
          font-size: 2rem;
          color: #fffdf6;
          line-height: 1;
        }

        .question-banner p {
          margin: 0;
          color: rgba(244, 236, 255, 0.84);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .option-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .option-grid span {
          border-radius: 999px;
          border: 1px solid rgba(255, 248, 235, 0.22);
          background: rgba(255, 248, 235, 0.08);
          color: #fff6e2;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 6px 10px;
          text-align: center;
        }

        .duel-progress {
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: 14px;
          z-index: 2;
        }

        .duel-progress span {
          display: block;
          margin-bottom: 6px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 250, 241, 0.92);
        }

        .momentum-track {
          height: 14px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(27, 22, 53, 0.44);
        }

        .momentum-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #5ed9ff, #ffd573, #e94c54);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.3);
          transition: width 0.2s ease;
        }

        .bottom-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .command-panel {
          border-radius: 18px;
          border: 3px solid var(--purple-line);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3);
          padding: 12px 14px;
          min-height: 140px;
        }

        .command-panel h3 {
          margin: 0 0 10px;
          font-size: 0.98rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #bdefff;
        }

        .input-shell {
          height: 48px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.94);
          color: #2f261e;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .attack-btn {
          margin-top: 10px;
          width: 100%;
          min-height: 44px;
          border-radius: 12px;
          border: 3px solid #6f2d1e;
          background: linear-gradient(180deg, #d97d54, #a84e30);
          color: var(--white);
          font: inherit;
          font-size: 0.92rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.18), inset 0 -5px 0 rgba(109, 41, 25, 0.36);
        }

        @media (max-width: 1060px) {
          .top-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .duel-strip {
            grid-template-columns: 1fr;
          }

          .versus-badge {
            justify-self: center;
          }

          .arena-content {
            grid-template-columns: 1fr;
            padding: 16px;
          }

          .tower {
            height: 74px;
          }

          .option-grid {
            grid-template-columns: 1fr;
          }

          .bottom-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .word-versus-root {
            padding: 8px;
          }

          .versus-shell {
            padding: 8px;
          }

          .top-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
