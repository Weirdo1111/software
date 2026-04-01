"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";

export function WordGameLanding({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="page-root" data-page="landing">
      <main className="cover">
        <div className="sky-layer" />
        <div className="mountains" />
        <div className="ground" />

        <section className="hero-scene">
          <div className="tower-block">
            <div className="tower-top" />
            <div className="tower-core">
              <div className="stone-shadow" />
            </div>
            <div className="gate-ring" />
          </div>

          <div className="ghost-group">
            <div className="ghost g1">
              <div className="ghost-body" />
              <div className="ghost-face">
                <div className="ghost-eye left" />
                <div className="ghost-eye right" />
                <div className="ghost-mouth" />
              </div>
            </div>
            <div className="ghost g2">
              <div className="ghost-body" />
              <div className="ghost-face">
                <div className="ghost-eye left" />
                <div className="ghost-eye right" />
                <div className="ghost-mouth" />
              </div>
            </div>
            <div className="ghost g3">
              <div className="ghost-body" />
              <div className="ghost-face">
                <div className="ghost-eye left" />
                <div className="ghost-eye right" />
                <div className="ghost-mouth" />
              </div>
            </div>
            <div className="ghost g4">
              <div className="ghost-body" />
              <div className="ghost-face">
                <div className="ghost-eye left" />
                <div className="ghost-eye right" />
                <div className="ghost-mouth" />
              </div>
            </div>
            <div className="ghost g5">
              <div className="ghost-body" />
              <div className="ghost-face">
                <div className="ghost-eye left" />
                <div className="ghost-eye right" />
                <div className="ghost-mouth" />
              </div>
            </div>
          </div>
        </section>

        <div className="hero-overlay" />
        <div className="frame-line" />

        <section className="hero-copy">
          <h1 className="hero-title">
            Word
            <br />
            <span className="violet">Defence</span>
          </h1>
          <div className="hero-actions">
            <button id="toSelect" className="btn-main" type="button" onClick={() => router.push(`/games/word-game/select?lang=${locale}`)}>
              Start Game
            </button>
            <button id="openRules" className="btn-ghost" type="button" onClick={() => setShowRules(true)}>
              View Rules
            </button>
          </div>
        </section>
      </main>

      <div id="rules-modal" className={showRules ? "open" : ""} onClick={() => setShowRules(false)}>
        <div className="modal-content" id="modal-box" onClick={(event) => event.stopPropagation()}>
          <button className="close-btn" id="closeRules" aria-label="Close" type="button" onClick={() => setShowRules(false)}>
            &times;
          </button>
          <h3 className="modal-title">Game Rules</h3>
          <div className="rule-block">
            <div className="rule-title">
              <span className="rule-icon" aria-hidden="true">🎯</span>
              <span>Core Objective</span>
            </div>
            <p className="rule-desc">
              Defend <span className="rule-key"> waves</span> of word enemies and protect the <span className="rule-key">Knowledge Core</span>. Clear all waves before
              the core is destroyed.
            </p>
          </div>
          <div className="rule-block">
            <div className="rule-title">
              <span className="rule-icon" aria-hidden="true">🔁</span>
              <span>Wave Structure</span>
            </div>
            <p className="rule-desc">
              Waves alternate between <span className="rule-key">spelling</span> challenges and <span className="rule-key">meaning</span> challenges. Each wave has one
              active enemy advancing toward the core.
            </p>
          </div>
          <div className="rule-block">
            <div className="rule-title">
              <span className="rule-icon" aria-hidden="true">⌨️</span>
              <span>Answer Method</span>
            </div>
            <p className="rule-desc">
              <span className="rule-key">Spelling Mode</span>: type the <span className="rule-key">complete correct word</span>. <span className="rule-key">Meaning
              Mode</span>: enter the   <span className="rule-key">correct option number</span> to attack.
            </p>
          </div>
          <div className="rule-block">
            <div className="rule-title">
              <span className="rule-icon" aria-hidden="true">⭐</span>
              <span>Scoring Rules</span>
            </div>
            <p className="rule-desc">
              Correct answers grant <span className="rule-key">base points</span>.
            </p>
          </div>
          <div className="rule-block">
            <div className="rule-title">
              <span className="rule-icon" aria-hidden="true">🛡️</span>
              <span>Shield Damage Rules</span>
            </div>
            <p className="rule-desc">
              A wrong answer reduces shield HP by <span className="rule-key">-1</span>. If an enemy reaches the core <span className="rule-key">(progress bar full)</span>,
              shield HP also decreases by <span className="rule-key">-1</span>.
            </p>
          </div>
          <div className="rule-block">
            <div className="rule-title">
              <span className="rule-icon" aria-hidden="true">🚨</span>
              <span>Critical State and Recovery</span>
            </div>
            <p className="rule-desc">
              When shield HP reaches <span className="rule-key">0</span>, battle enters <span className="rule-key">system critical state</span>. You must complete the
              recovery review stage before continuing.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
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
          --wood-light: #d18d53;
          --wood-mid: #9a5737;
          --wood-dark: #64311f;
          --purple-line: #241541;
          --purple-glow: #ecb8ff;
          --white: #fffef8;
          --cream: #fff1d3;
        }

        * {
          box-sizing: border-box;
        }

        .page-root {
          margin: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          color: var(--white);
          background: radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.36), transparent 18%),
            linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-bottom) 100%);
        }

        button {
          font: inherit;
        }

        .cover {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
        }

        .sky-layer {
          position: absolute;
          inset: 0 0 42% 0;
          background: radial-gradient(circle at 52% 18%, rgba(255, 255, 255, 0.24), transparent 12%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
        }

        .mountains {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 26%;
          height: 250px;
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
          opacity: 0.96;
        }

        .mountains::after {
          transform: translateY(52px);
          clip-path: polygon(0% 100%, 10% 62%, 24% 100%, 40% 54%, 56% 100%, 74% 48%, 90% 100%, 100% 66%, 100% 100%);
          background: var(--hill-mid);
          opacity: 0.98;
        }

        .ground {
          position: absolute;
          left: -2%;
          right: -2%;
          bottom: -8%;
          height: 42%;
          background: radial-gradient(circle at 18% 12%, rgba(194, 240, 103, 0.8), rgba(194, 240, 103, 0) 18%),
            radial-gradient(circle at 80% 18%, rgba(194, 240, 103, 0.5), rgba(194, 240, 103, 0) 16%),
            linear-gradient(180deg, var(--grass-light) 0%, var(--grass-mid) 50%, var(--grass-dark) 100%);
          clip-path: polygon(0 42%, 12% 28%, 23% 26%, 38% 34%, 50% 31%, 60% 24%, 72% 28%, 82% 18%, 100% 26%, 100% 100%, 0 100%);
          box-shadow: inset 0 10px 0 rgba(255, 255, 255, 0.15);
        }

        .ground::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 8px;
          height: 26px;
          background: linear-gradient(180deg, rgba(240, 255, 184, 0.55), rgba(240, 255, 184, 0));
          opacity: 0.45;
        }

        .hero-scene {
          position: absolute;
          inset: 0;
        }

        .tower-block {
          position: absolute;
          left: 4%;
          bottom: 14%;
          width: 416px;
          height: 559px;
          filter: drop-shadow(0 22px 0 rgba(69, 53, 42, 0.3));
        }

        .tower-core {
          position: absolute;
          inset: 94px 54px 0;
          background: radial-gradient(circle at 32% 16%, rgba(255, 255, 255, 0.18), transparent 18%),
            linear-gradient(180deg, var(--stone-top) 0%, var(--stone-mid) 44%, #786f68 100%);
          border: 4px solid #4f4540;
          border-radius: 28px 28px 22px 22px;
          clip-path: polygon(12% 0, 88% 0, 100% 100%, 0 100%);
        }

        .tower-core::before {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 128px;
          height: 176px;
          background: linear-gradient(180deg, var(--wood-light), var(--wood-mid));
          border: 4px solid var(--wood-dark);
          border-bottom-width: 6px;
          border-radius: 34px 34px 16px 16px;
        }

        .tower-core::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 74px;
          transform: translateX(-50%);
          width: 78px;
          height: 118px;
          background: linear-gradient(180deg, rgba(40, 25, 24, 0.8), rgba(71, 52, 48, 0.94));
          border: 4px solid #5a5048;
          border-radius: 28px 28px 12px 12px;
          box-shadow: inset 0 0 0 3px rgba(212, 199, 177, 0.24);
        }

        .tower-top {
          position: absolute;
          left: 38px;
          right: 38px;
          top: 28px;
          height: 146px;
          background: linear-gradient(180deg, #d7c8ab 0%, #9e8f7f 100%);
          border: 4px solid #4f4540;
          border-radius: 26px;
          box-shadow: inset 0 -10px 0 rgba(63, 51, 47, 0.24);
        }

        .tower-top::before {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: -14px;
          height: 28px;
          background: linear-gradient(
            90deg,
            transparent 6%,
            #c5b391 6%,
            #c5b391 15%,
            transparent 15%,
            transparent 27%,
            #c5b391 27%,
            #c5b391 36%,
            transparent 36%,
            transparent 48%,
            #c5b391 48%,
            #c5b391 57%,
            transparent 57%,
            transparent 69%,
            #c5b391 69%,
            #c5b391 78%,
            transparent 78%,
            transparent 90%,
            #c5b391 90%,
            #c5b391 100%
          );
        }

        .stone-shadow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(49, 40, 36, 0.32), transparent 22%, transparent 76%, rgba(255, 255, 255, 0.12) 100%);
          mix-blend-mode: multiply;
          opacity: 0.8;
        }

        .gate-ring {
          position: absolute;
          left: 50%;
          bottom: 64px;
          transform: translateX(48px);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 4px solid #51443b;
          background: rgba(255, 255, 255, 0.22);
          z-index: 2;
        }

        .ghost-group {
          position: absolute;
          right: 3%;
          top: 10%;
          width: 46%;
          height: 56%;
        }

        .ghost {
          position: absolute;
          width: var(--size, 120px);
          height: calc(var(--size, 120px) * 0.95);
          filter: drop-shadow(0 18px 0 rgba(74, 44, 91, 0.2)) drop-shadow(0 24px 28px rgba(53, 28, 61, 0.18));
          animation: floatGhost 4.2s ease-in-out infinite;
        }

        .ghost-body {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 38% 22%, rgba(255, 255, 255, 0.14), transparent 18%),
            linear-gradient(180deg, #7253b9 0%, #4c317f 58%, #2c1a51 100%);
          border: 4px solid #2e1b46;
          border-radius: 48% 48% 40% 40% / 42% 42% 55% 55%;
        }

        .ghost-body::before,
        .ghost-body::after {
          content: "";
          position: absolute;
          top: 18px;
          width: 24px;
          height: 34px;
          background: inherit;
          border: 4px solid #2e1b46;
          border-radius: 50% 50% 0 0;
        }

        .ghost-body::before {
          right: 8px;
          transform: rotate(18deg);
          border-bottom: none;
        }

        .ghost-body::after {
          left: 10px;
          transform: rotate(-14deg);
          border-bottom: none;
          opacity: 0.88;
        }

        .ghost-face {
          position: absolute;
          inset: 0;
        }

        .ghost-eye {
          position: absolute;
          top: 38px;
          width: 22px;
          height: 18px;
          background: var(--purple-glow);
          border-radius: 60% 60% 50% 50%;
          box-shadow: 0 0 12px rgba(236, 184, 255, 0.65);
        }

        .ghost-eye.left {
          left: 34px;
          transform: rotate(-18deg);
        }

        .ghost-eye.right {
          right: 30px;
          transform: rotate(18deg);
        }

        .ghost-mouth {
          position: absolute;
          left: 50%;
          top: 70px;
          transform: translateX(-50%);
          width: 54px;
          height: 24px;
          background: #241233;
          clip-path: polygon(0 22%, 12% 0, 26% 22%, 40% 0, 54% 22%, 68% 0, 82% 22%, 100% 0, 100% 100%, 0 100%);
          border-radius: 0 0 14px 14px;
          box-shadow: inset 0 -6px 0 rgba(255, 255, 255, 0.04);
        }

        .ghost.g1 {
          --size: 156px;
          right: 4%;
          top: 40%;
          transform: rotate(6deg);
          animation-delay: -0.5s;
        }

        .ghost.g2 {
          --size: 120px;
          right: 24%;
          top: 24%;
          transform: rotate(-10deg);
          animation-delay: -1.6s;
        }

        .ghost.g3 {
          --size: 92px;
          right: 42%;
          top: 10%;
          transform: rotate(8deg);
          animation-delay: -2.2s;
        }

        .ghost.g4 {
          --size: 74px;
          right: 18%;
          top: 2%;
          transform: rotate(14deg);
          animation-delay: -2.8s;
        }

        .ghost.g5 {
          --size: 106px;
          right: 54%;
          top: 22%;
          transform: rotate(-12deg);
          animation-delay: -1s;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(16, 18, 37, 0.48) 0%, rgba(16, 18, 37, 0.18) 34%, rgba(16, 18, 37, 0.02) 60%),
            linear-gradient(180deg, rgba(16, 18, 37, 0.16) 0%, rgba(16, 18, 37, 0) 34%, rgba(16, 18, 37, 0.3) 100%);
          pointer-events: none;
        }

        .hero-copy {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%);
          z-index: 3;
          width: min(860px, calc(100vw - 80px));
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          translate: 0 -46%;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(3.8rem, 8vw, 7.8rem);
          line-height: 0.9;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cream);
          text-shadow: 0 4px 0 rgba(55, 33, 24, 0.18), 0 18px 30px rgba(33, 22, 25, 0.16);
        }

        .hero-title .violet {
          color: #f0c4ff;
          text-shadow: 0 0 16px rgba(236, 184, 255, 0.36), 0 10px 18px rgba(52, 26, 71, 0.2);
        }

        .hero-actions {
          display: flex;
          gap: 22px;
          margin-top: 32px;
        }

        .btn-main,
        .btn-ghost {
          position: relative;
          isolation: isolate;
          border: none;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          font-size: 1.5rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 999px;
          min-width: 240px;
          padding: 22px 36px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-main::before,
        .btn-ghost::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 38%,
            rgba(255, 255, 255, 0.96) 50%,
            rgba(255, 255, 255, 0) 62%,
            rgba(255, 255, 255, 0) 100%
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          opacity: 0;
          transform: translateX(-140%);
          pointer-events: none;
          z-index: 2;
        }

        .btn-main {
          background: linear-gradient(180deg, #d97d54, #a84e30);
          color: var(--white);
          border: 3px solid #6f2d1e;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.18), inset 0 -5px 0 rgba(109, 41, 25, 0.36), 0 6px 0 rgba(109, 41, 25, 0.38);
        }

        .btn-ghost {
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          color: var(--cream);
          border: 3px solid var(--purple-line);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 6px 0 rgba(36, 21, 65, 0.34);
        }

        .btn-main:hover,
        .btn-ghost:hover {
          transform: translateY(-2px);
        }

        .btn-main:hover::before,
        .btn-ghost:hover::before {
          opacity: 1;
          animation: capsuleBeam 1.1s linear infinite;
        }

        .frame-line {
          position: absolute;
          inset: 18px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          pointer-events: none;
        }

        #rules-modal {
          position: fixed;
          inset: 0;
          display: none;
          justify-content: center;
          align-items: center;
          background: rgba(20, 18, 30, 0.7);
          backdrop-filter: blur(10px);
          z-index: 100;
        }

        #rules-modal.open {
          display: flex;
        }

        .modal-content {
          position: relative;
          width: min(560px, calc(100vw - 40px));
          padding: 34px 32px 28px;
          border-radius: 24px;
          background: radial-gradient(circle at 26% 14%, rgba(136, 104, 206, 0.24), rgba(136, 104, 206, 0) 36%),
            radial-gradient(circle at 84% 86%, rgba(85, 176, 255, 0.16), rgba(85, 176, 255, 0) 42%),
            linear-gradient(180deg, rgba(68, 47, 114, 0.98), rgba(39, 24, 67, 0.98));
          border: 3px solid var(--purple-line);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(236, 184, 255, 0.24), 0 0 0 1px rgba(157, 119, 255, 0.25),
            0 14px 28px rgba(29, 18, 49, 0.34), 0 0 24px rgba(120, 84, 186, 0.26);
        }

        .modal-content::before {
          content: "";
          position: absolute;
          inset: 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          pointer-events: none;
        }

        .close-btn {
          position: absolute;
          top: 14px;
          right: 16px;
          border: none;
          background: none;
          color: rgba(255, 255, 255, 0.72);
          font-size: 26px;
          cursor: pointer;
        }

        .modal-title {
          margin: 0 0 24px;
          color: var(--cream);
          font-size: 1.45rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow: 0 0 12px rgba(236, 184, 255, 0.24);
        }

        .rule-block {
          position: relative;
          margin-bottom: 0;
          padding: 0 2px 18px;
        }

        .rule-block:not(:last-child) {
          margin-bottom: 18px;
        }

        .rule-block:not(:last-child)::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(180, 232, 255, 0.42), rgba(255, 255, 255, 0));
        }

        .rule-title {
          margin-bottom: 8px;
          color: #bdefff;
          font-size: 1.02rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.02em;
        }

        .rule-icon {
          width: 28px;
          height: 28px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.06));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 3px 8px rgba(25, 15, 43, 0.28);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
        }

        .rule-desc {
          margin: 0;
          color: rgba(255, 248, 235, 0.8);
          line-height: 1.75;
          font-size: 0.95rem;
          padding-left: 38px;
        }

        .rule-key {
          color: #ffe39a;
          font-weight: 800;
        }

        @keyframes floatGhost {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -10px;
          }
        }

        @keyframes capsuleBeam {
          0% {
            transform: translateX(-140%);
          }
          100% {
            transform: translateX(140%);
          }
        }

        @media (max-width: 980px) {
          .hero-copy {
            top: 48%;
          }

          .tower-block {
            transform: scale(0.78);
            transform-origin: bottom left;
          }

          .ghost-group {
            width: 54%;
          }
        }

        @media (max-width: 760px) {
          .page-root {
            overflow: auto;
          }

          .cover {
            min-height: 100vh;
          }

          .hero-copy {
            width: calc(100vw - 40px);
            top: 48%;
            translate: 0 -50%;
          }

          .hero-actions {
            flex-direction: column;
            max-width: 360px;
          }

          .tower-block {
            left: -60px;
            bottom: 16%;
            transform: scale(0.62);
            transform-origin: bottom left;
          }

          .ghost-group {
            right: -18px;
            width: 64%;
            top: 18%;
          }
        }
      `}</style>
    </div>
  );
}

