"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";

const BANK_LABELS: Record<string, string> = {
  general: "General Academic",
  cs: "Computer Science",
  math: "Mathematics",
  civil: "Civil Engineering",
  mechanical: "Mechanical Engineering",
  transport: "Transportation Engineering",
};

export function WordGameBattle({ locale, bank }: { locale: Locale; bank: string }) {
  const [answer, setAnswer] = useState("");

  const copy = useMemo(
    () =>
      locale === "zh"
        ? {
            discipline: "学科",
            hp: "生命值",
            score: "分数",
            threat: "威胁等级",
            mode: "拼写模式",
            hint: "输入完整单词来击败最前方怪物。",
            answerTitle: "作答区",
            enterHint: "按 Enter 提交",
            placeholder: "在这里输入完整单词...",
            attack: "攻击",
            unified: "拼写题与释义题共用一个输入框。",
            shield: "回答错误 = 护盾受损",
          }
        : {
            discipline: "Discipline",
            hp: "HP",
            score: "Score",
            threat: "Threat",
            mode: "Spelling Mode",
            hint: "Retype the complete word to defeat the front monster.",
            answerTitle: "Answer Area",
            enterHint: "Press Enter To Submit",
            placeholder: "Type the full word here...",
            attack: "Attack",
            unified: "One unified input box for spelling and meaning questions.",
            shield: "Wrong answer = Shield damage",
          },
    [locale],
  );

  const disciplineName = BANK_LABELS[bank] ?? BANK_LABELS.general;

  return (
    <div className="word-battle-root" data-page="battle">
      <main className="scene">
        <section className="top-hud">
          <div className="hud-card">
            <span>{copy.discipline}</span>
            <strong>{disciplineName}</strong>
          </div>
          <div className="hud-card">
            <span>{copy.hp}</span>
            <strong>5 / 5</strong>
          </div>
          <div className="hud-card">
            <span>{copy.score}</span>
            <strong>1450</strong>
          </div>
          <div className="hud-card">
            <span>{copy.threat}</span>
            <strong>03</strong>
          </div>
        </section>

        <section className="battle-wrap">
          <div className="sky-layer">
            <div className="cloud c1" />
            <div className="cloud c2" />
            <div className="cloud c3" />
          </div>
          <div className="mountains" />
          <div className="ground" />
          <div className="bush b1" />
          <div className="bush b2" />

          <div className="battle-lane">
            <div className="tower-block">
              <div className="tower-top" />
              <div className="tower-core">
                <div className="stone-shadow" />
              </div>
              <div className="gate-ring" />
            </div>

            <div className="ghost-group">
              <div className="ghost g4">
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
              <div className="ghost g2">
                <div className="ghost-body" />
                <div className="ghost-face">
                  <div className="ghost-eye left" />
                  <div className="ghost-eye right" />
                  <div className="ghost-mouth" />
                </div>
              </div>
              <div className="ghost g1">
                <div className="ghost-body" />
                <div className="ghost-face">
                  <div className="ghost-eye left" />
                  <div className="ghost-eye right" />
                  <div className="ghost-mouth" />
                </div>
              </div>
            </div>

            <div className="question-banner">
              <div className="banner-mode">{copy.mode}</div>
              <div className="banner-word">A_GORITHM</div>
              <div className="banner-hint">{copy.hint}</div>
            </div>
          </div>
        </section>

        <section className="console-wrap">
          <form
            className="answer-board"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <div className="answer-content">
              <div className="answer-head">
                <strong>{copy.answerTitle}</strong>
                <span>{copy.enterHint}</span>
              </div>

              <div className="answer-input-row">
                <label className="answer-slot" htmlFor="battle-answer-input">
                  <input
                    id="battle-answer-input"
                    className="answer-input"
                    type="text"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder={copy.placeholder}
                  />
                </label>
                <button className="submit-btn" type="submit">
                  {copy.attack}
                </button>
              </div>

              <div className="answer-note">
                <span>{copy.unified}</span>
                <span>{copy.shield}</span>
              </div>
            </div>
          </form>
        </section>
      </main>

      <style jsx global>{`
        .word-battle-root {
          --sky-top: #7fd7e9;
          --sky-mid: #a6f0e4;
          --sky-bottom: #d3ffd6;
          --hill-far: #94d8c8;
          --hill-mid: #6bbb8d;
          --hill-near: #5a9d63;
          --grass-light: #96d45a;
          --grass-mid: #73b246;
          --grass-dark: #406427;
          --stone-top: #d1c1a1;
          --stone-mid: #968a7a;
          --stone-dark: #584d4b;
          --wood-light: #d18d53;
          --wood-mid: #9a5737;
          --wood-dark: #64311f;
          --ui-cream: #f6ecd0;
          --ui-shadow: #4f3422;
          --purple-main: #58408f;
          --purple-dark: #33225b;
          --purple-line: #251945;
          --purple-glow: #e8b6ff;
          --ink: #23192a;
          --white: #fffef8;
          --danger: #e94c54;
          --ok: #74d55a;
          position: relative;
          min-height: 100vh;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          color: var(--white);
          overflow: hidden;
          background: radial-gradient(circle at 50% 22%, rgba(255, 255, 255, 0.58), transparent 20%),
            linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-bottom) 100%);
        }

        .word-battle-root * {
          box-sizing: border-box;
        }

        .word-battle-root::before,
        .word-battle-root::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          pointer-events: none;
          z-index: 0;
        }

        .word-battle-root::before {
          height: 48vh;
          background: radial-gradient(ellipse at 15% 82%, rgba(41, 72, 37, 0.28), transparent 20%),
            radial-gradient(ellipse at 83% 86%, rgba(41, 72, 37, 0.24), transparent 16%),
            linear-gradient(180deg, rgba(140, 226, 190, 0), rgba(140, 226, 190, 0.16));
        }

        .word-battle-root::after {
          height: 24vh;
          background: linear-gradient(180deg, rgba(80, 135, 51, 0) 0%, rgba(80, 135, 51, 0.1) 100%);
        }

        .word-battle-root .scene {
          position: relative;
          z-index: 1;
          width: min(1380px, calc(100vw - 40px));
          height: min(920px, calc(100vh - 28px));
          margin: 14px auto;
          padding: 14px;
          border-radius: 34px;
          background: linear-gradient(180deg, rgba(110, 94, 176, 0.18), rgba(83, 67, 142, 0.08)), rgba(33, 24, 64, 0.18);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16), 0 24px 50px rgba(33, 24, 64, 0.22);
          display: grid;
          grid-template-rows: 62px 1fr 184px;
          gap: 14px;
          overflow: hidden;
        }

        .word-battle-root .top-hud {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .word-battle-root .hud-card {
          border-radius: 22px;
          padding: 12px 18px;
          background: linear-gradient(180deg, rgba(61, 45, 112, 0.94), rgba(47, 33, 88, 0.98));
          border: 3px solid var(--purple-line);
          box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.14), inset 0 -4px 0 rgba(14, 9, 31, 0.22), 0 8px 0 rgba(42, 28, 77, 0.55);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .word-battle-root .hud-card span {
          font-size: 0.76rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(249, 241, 255, 0.74);
        }

        .word-battle-root .hud-card strong {
          margin-top: 4px;
          font-size: 1.55rem;
          line-height: 1;
        }

        .word-battle-root .battle-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          background: linear-gradient(180deg, rgba(188, 252, 255, 0.28), rgba(90, 141, 202, 0.05) 40%, rgba(0, 0, 0, 0) 41%),
            linear-gradient(180deg, rgba(98, 126, 220, 0.22), rgba(38, 42, 113, 0.06));
          border: 4px solid rgba(47, 33, 88, 0.68);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.12), 0 12px 0 rgba(50, 33, 87, 0.4);
        }

        .word-battle-root .sky-layer {
          position: absolute;
          inset: 0 0 42% 0;
          background: radial-gradient(circle at 52% 20%, rgba(255, 255, 255, 0.6), transparent 12%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0));
        }

        .word-battle-root .cloud {
          position: absolute;
          background: rgba(247, 255, 255, 0.58);
          border-radius: 999px;
          box-shadow: 40px 6px 0 0 rgba(247, 255, 255, 0.48), 18px -12px 0 0 rgba(247, 255, 255, 0.56);
        }

        .word-battle-root .cloud.c1 {
          width: 110px;
          height: 28px;
          top: 40px;
          left: 90px;
        }

        .word-battle-root .cloud.c2 {
          width: 140px;
          height: 32px;
          top: 62px;
          right: 180px;
        }

        .word-battle-root .cloud.c3 {
          width: 95px;
          height: 24px;
          top: 126px;
          left: 44%;
        }

        .word-battle-root .mountains {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 30%;
          height: 220px;
        }

        .word-battle-root .mountains::before,
        .word-battle-root .mountains::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 100%;
        }

        .word-battle-root .mountains::before {
          clip-path: polygon(0% 100%, 12% 48%, 24% 100%, 38% 38%, 52% 100%, 67% 42%, 82% 100%, 100% 52%, 100% 100%);
          background-color: var(--hill-far);
          opacity: 0.95;
        }

        .word-battle-root .mountains::after {
          transform: translateY(46px);
          clip-path: polygon(0% 100%, 10% 62%, 24% 100%, 41% 54%, 56% 100%, 74% 48%, 89% 100%, 100% 66%, 100% 100%);
          background: var(--hill-mid);
          opacity: 0.96;
        }

        .word-battle-root .ground {
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

        .word-battle-root .ground::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 8px;
          height: 26px;
          background: linear-gradient(180deg, rgba(240, 255, 184, 0.55), rgba(240, 255, 184, 0));
          opacity: 0.45;
        }

        .word-battle-root .bush {
          position: absolute;
          bottom: 18px;
          width: 160px;
          height: 96px;
          background: var(--grass-dark);
          border-radius: 60px;
          filter: drop-shadow(0 8px 0 rgba(25, 56, 20, 0.5));
        }

        .word-battle-root .bush::before,
        .word-battle-root .bush::after {
          content: "";
          position: absolute;
          bottom: 10px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: inherit;
        }

        .word-battle-root .bush::before {
          left: 14px;
        }

        .word-battle-root .bush::after {
          right: 8px;
        }

        .word-battle-root .bush.b1 {
          left: -10px;
          transform: scale(1.05);
        }

        .word-battle-root .bush.b2 {
          right: -18px;
          width: 190px;
          height: 104px;
        }

        .word-battle-root .battle-lane {
          position: absolute;
          left: 7%;
          right: 6%;
          bottom: 8%;
          top: 10%;
        }

        .word-battle-root .tower-block {
          position: absolute;
          left: 6%;
          bottom: 17%;
          width: 220px;
          height: 290px;
          filter: drop-shadow(0 18px 0 rgba(69, 53, 42, 0.32));
        }

        .word-battle-root .tower-core {
          position: absolute;
          inset: 52px 30px 0;
          background: radial-gradient(circle at 32% 16%, rgba(255, 255, 255, 0.18), transparent 18%),
            linear-gradient(180deg, var(--stone-top) 0%, var(--stone-mid) 44%, #786f68 100%);
          border: 4px solid #4f4540;
          border-radius: 28px 28px 22px 22px;
          clip-path: polygon(12% 0, 88% 0, 100% 100%, 0 100%);
        }

        .word-battle-root .tower-core::before {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 78px;
          height: 106px;
          background: linear-gradient(180deg, var(--wood-light), var(--wood-mid));
          border: 4px solid var(--wood-dark);
          border-bottom-width: 6px;
          border-radius: 32px 32px 14px 14px;
        }

        .word-battle-root .tower-core::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 40px;
          transform: translateX(-50%);
          width: 46px;
          height: 66px;
          background: linear-gradient(180deg, rgba(40, 25, 24, 0.8), rgba(71, 52, 48, 0.94));
          border: 4px solid #5a5048;
          border-radius: 26px 26px 12px 12px;
          box-shadow: inset 0 0 0 3px rgba(212, 199, 177, 0.24);
        }

        .word-battle-root .tower-top {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 14px;
          height: 82px;
          background: linear-gradient(180deg, #d7c8ab 0%, #9e8f7f 100%);
          border: 4px solid #4f4540;
          border-radius: 26px;
          box-shadow: inset 0 -10px 0 rgba(63, 51, 47, 0.24);
        }

        .word-battle-root .tower-top::before {
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

        .word-battle-root .stone-shadow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(49, 40, 36, 0.32), transparent 22%, transparent 76%, rgba(255, 255, 255, 0.12) 100%);
          mix-blend-mode: multiply;
          opacity: 0.8;
          border-radius: inherit;
          pointer-events: none;
        }

        .word-battle-root .gate-ring {
          position: absolute;
          left: 50%;
          bottom: 38px;
          transform: translateX(30px);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 4px solid #51443b;
          background: rgba(255, 255, 255, 0.22);
          z-index: 2;
        }

        .word-battle-root .ghost-group {
          position: absolute;
          right: 6%;
          top: 13%;
          width: 52%;
          height: 60%;
        }

        .word-battle-root .ghost {
          position: absolute;
          width: var(--size, 120px);
          height: calc(var(--size, 120px) * 0.95);
          filter: drop-shadow(0 18px 0 rgba(74, 44, 91, 0.2)) drop-shadow(0 24px 28px rgba(53, 28, 61, 0.18));
        }

        .word-battle-root .ghost-body {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 38% 22%, rgba(255, 255, 255, 0.14), transparent 18%),
            linear-gradient(180deg, #7253b9 0%, #4c317f 58%, #2c1a51 100%);
          border: 4px solid #2e1b46;
          border-radius: 48% 48% 40% 40% / 42% 42% 55% 55%;
        }

        .word-battle-root .ghost-body::before,
        .word-battle-root .ghost-body::after {
          content: "";
          position: absolute;
          top: 18px;
          width: 24px;
          height: 34px;
          background: inherit;
          border: 4px solid #2e1b46;
          border-radius: 50% 50% 0 0;
        }

        .word-battle-root .ghost-body::before {
          right: 8px;
          transform: rotate(18deg);
          border-bottom: none;
        }

        .word-battle-root .ghost-body::after {
          left: 10px;
          transform: rotate(-14deg);
          border-bottom: none;
          opacity: 0.88;
        }

        .word-battle-root .ghost-face {
          position: absolute;
          inset: 0;
        }

        .word-battle-root .ghost-eye {
          position: absolute;
          top: 38px;
          width: 22px;
          height: 18px;
          background: var(--purple-glow);
          border-radius: 60% 60% 50% 50%;
          box-shadow: 0 0 12px rgba(232, 182, 255, 0.65);
        }

        .word-battle-root .ghost-eye.left {
          left: 34px;
          transform: rotate(-18deg);
        }

        .word-battle-root .ghost-eye.right {
          right: 30px;
          transform: rotate(18deg);
        }

        .word-battle-root .ghost-mouth {
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

        .word-battle-root .ghost.g1 {
          --size: 128px;
          right: 12%;
          top: 30%;
          transform: rotate(6deg);
        }

        .word-battle-root .ghost.g2 {
          --size: 104px;
          right: 38%;
          top: 14%;
          transform: rotate(-10deg);
        }

        .word-battle-root .ghost.g3 {
          --size: 92px;
          right: 56%;
          top: 2%;
          transform: rotate(8deg);
        }

        .word-battle-root .ghost.g4 {
          --size: 74px;
          right: 22%;
          top: 0;
          transform: rotate(14deg);
        }

        .word-battle-root .question-banner {
          position: absolute;
          right: 11%;
          bottom: 23%;
          width: 320px;
          padding: 14px 16px 12px;
          background: linear-gradient(180deg, rgba(57, 38, 91, 0.96), rgba(36, 21, 63, 0.98));
          border: 4px solid #27163f;
          border-radius: 24px;
          box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.1), 0 10px 0 rgba(43, 25, 66, 0.38);
        }

        .word-battle-root .question-banner::before {
          content: "";
          position: absolute;
          inset: 10px;
          border-radius: 16px;
          border: 2px solid rgba(255, 214, 110, 0.24);
          pointer-events: none;
        }

        .word-battle-root .banner-mode {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ffd877, #f0ba45);
          color: #5a370d;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 4px 0 rgba(135, 93, 23, 0.35);
        }

        .word-battle-root .banner-word {
          margin-top: 12px;
          font-size: 2.15rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #fffdf6;
          text-shadow: 0 3px 0 rgba(24, 10, 44, 0.4);
        }

        .word-battle-root .banner-hint {
          margin-top: 8px;
          color: rgba(244, 236, 255, 0.8);
          font-size: 0.96rem;
          line-height: 1.5;
        }

        .word-battle-root .console-wrap {
          position: relative;
        }

        .word-battle-root .answer-board {
          position: relative;
          height: 100%;
          border-radius: 28px;
          padding: 16px 18px 18px;
          background: linear-gradient(180deg, #ccb18a 0%, #a97f51 100%);
          border: 4px solid #5b3421;
          box-shadow: inset 0 4px 0 rgba(255, 255, 255, 0.28), inset 0 -8px 0 rgba(108, 64, 39, 0.35), 0 12px 0 rgba(79, 46, 27, 0.45),
            0 24px 30px rgba(58, 34, 20, 0.2);
        }

        .word-battle-root .answer-board::before {
          content: "";
          position: absolute;
          inset: 10px;
          border-radius: 20px;
          background: linear-gradient(180deg, #f7ebcf, #e8d4aa);
          border: 3px solid rgba(97, 62, 36, 0.35);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.5);
        }

        .word-battle-root .answer-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 12px;
        }

        .word-battle-root .answer-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #55341f;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .word-battle-root .answer-head strong {
          font-size: 1.02rem;
        }

        .word-battle-root .answer-head span {
          font-size: 0.82rem;
        }

        .word-battle-root .answer-input-row {
          display: grid;
          grid-template-columns: 1fr 110px;
          gap: 12px;
          align-items: center;
        }

        .word-battle-root .answer-slot {
          position: relative;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(180deg, #fffef9, #f3efe6);
          border: 3px solid #8e7762;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.65), inset 0 -4px 0 rgba(144, 128, 113, 0.22);
          display: flex;
          align-items: center;
          padding: 0 18px;
          color: rgba(74, 61, 53, 0.56);
          font-size: 0.98rem;
          font-weight: 700;
        }

        .word-battle-root .answer-input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #4a3d35;
          font-size: 0.98rem;
          font-weight: 700;
        }

        .word-battle-root .answer-input::placeholder {
          color: rgba(74, 61, 53, 0.56);
        }

        .word-battle-root .submit-btn {
          height: 52px;
          border-radius: 14px;
          border: 3px solid #6f2d1e;
          background: linear-gradient(180deg, #d97d54, #a84e30);
          color: var(--white);
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.18), inset 0 -5px 0 rgba(109, 41, 25, 0.36), 0 6px 0 rgba(109, 41, 25, 0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .word-battle-root .answer-note {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #61452d;
          font-size: 0.88rem;
          font-weight: 800;
        }

        .word-battle-root .answer-note span:last-child {
          color: #7d3b2f;
        }

        @media (max-width: 1180px) {
          .word-battle-root .scene {
            width: calc(100vw - 24px);
            height: auto;
            min-height: calc(100vh - 24px);
            grid-template-rows: auto minmax(420px, 1fr) 210px;
          }

          .word-battle-root .top-hud {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .word-battle-root .tower-block {
            transform: scale(0.86);
            transform-origin: bottom left;
          }

          .word-battle-root .question-banner {
            width: 280px;
            right: 6%;
          }
        }

        @media (max-width: 860px) {
          .word-battle-root {
            overflow: auto;
          }

          .word-battle-root .scene {
            width: calc(100vw - 16px);
            margin: 8px auto;
            padding: 10px;
            grid-template-rows: auto 540px 210px;
          }

          .word-battle-root .top-hud {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .word-battle-root .hud-card {
            padding: 10px 12px;
          }

          .word-battle-root .battle-lane {
            left: 3%;
            right: 3%;
            top: 8%;
          }

          .word-battle-root .tower-block {
            left: -2%;
            bottom: 20%;
            transform: scale(0.72);
            transform-origin: bottom left;
          }

          .word-battle-root .ghost-group {
            right: -2%;
            width: 64%;
          }

          .word-battle-root .question-banner {
            width: 220px;
            bottom: 20%;
            right: 2%;
          }

          .word-battle-root .banner-word {
            font-size: 1.7rem;
          }

          .word-battle-root .answer-input-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
