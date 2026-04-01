"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { RecoveryWord } from "@/lib/games/word-game-recovery";
import type { Locale } from "@/lib/i18n/dictionaries";

type EnemyType = "spell" | "meaning";

type WordEntry = RecoveryWord;

type BattleQuestion = {
  type: EnemyType;
  entry: WordEntry;
  maskedWord: string;
  options: WordEntry[];
  correctOptionIndex: number;
};

const TOTAL_WAVES = 6;
const MAX_HP = 5;
const RECOVER_HP = 3;

const BANK_LABELS: Record<string, string> = {
  general: "General Academic",
  cs: "Computer Science",
  math: "Mathematics",
  civil: "Civil Engineering",
  mechanical: "Mechanical Engineering",
  transport: "Transportation Engineering",
};

const WORD_POOL: WordEntry[] = [
  { word: "algorithm", meaningEn: "A step-by-step method.", meaningZh: "步骤化求解方法。", examples: [{ en: "This algorithm is fast.", zh: "这个算法很快。" }], uk: "UK /ˈælɡərɪðəm/", us: "US /ˈælɡərɪðəm/" },
  { word: "dataset", meaningEn: "A structured data collection.", meaningZh: "结构化数据集合。", examples: [{ en: "The dataset is clean.", zh: "这个数据集很干净。" }], uk: "UK /ˈdeɪtəset/", us: "US /ˈdeɪtəset/" },
  { word: "protocol", meaningEn: "A formal communication rule.", meaningZh: "正式通信规则。", examples: [{ en: "HTTPS is a protocol.", zh: "HTTPS 是一种协议。" }], uk: "UK /ˈprəʊtəkɒl/", us: "US /ˈproʊtəkɔːl/" },
  { word: "optimize", meaningEn: "Make as effective as possible.", meaningZh: "使其尽可能高效。", examples: [{ en: "Optimize this query.", zh: "优化这个查询。" }], uk: "UK /ˈɒptɪmaɪz/", us: "US /ˈɑːptəmaɪz/" },
  { word: "resilient", meaningEn: "Able to recover quickly.", meaningZh: "能快速恢复。", examples: [{ en: "A resilient design helps.", zh: "有韧性的设计很有帮助。" }], uk: "UK /rɪˈzɪliənt/", us: "US /rɪˈzɪliənt/" },
  { word: "simulate", meaningEn: "Imitate system behavior.", meaningZh: "模拟系统行为。", examples: [{ en: "Simulate user traffic.", zh: "模拟用户流量。" }], uk: "UK /ˈsɪmjʊleɪt/", us: "US /ˈsɪmjəleɪt/" },
  { word: "robust", meaningEn: "Strong and reliable.", meaningZh: "强健且可靠。", examples: [{ en: "Need a robust service.", zh: "需要稳健的服务。" }], uk: "UK /rəʊˈbʌst/", us: "US /roʊˈbʌst/" },
  { word: "inference", meaningEn: "A conclusion from evidence.", meaningZh: "依据证据得出的推断。", examples: [{ en: "The inference is correct.", zh: "这个推断是正确的。" }], uk: "UK /ˈɪnfərəns/", us: "US /ˈɪnfərəns/" },
];

const shuffle = <T,>(list: T[]) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const maskWord = (word: string) => {
  const idx = Math.min(2, Math.max(1, word.length - 2));
  return word
    .split("")
    .map((ch, i) => (i === idx ? "_" : ch))
    .join("")
    .toUpperCase();
};

const buildQuestions = (): BattleQuestion[] =>
  shuffle(WORD_POOL)
    .slice(0, TOTAL_WAVES)
    .map((entry, index) => {
      const options = shuffle([entry, ...shuffle(WORD_POOL.filter((w) => w.word !== entry.word)).slice(0, 3)]);
      return {
        type: index % 2 === 0 ? "spell" : "meaning",
        entry,
        maskedWord: maskWord(entry.word),
        options,
        correctOptionIndex: options.findIndex((o) => o.word === entry.word),
      };
    });

export function WordGameBattle({ locale, bank }: { locale: Locale; bank: string }) {
  const router = useRouter();
  const questions = useMemo(() => buildQuestions(), []);
  const initialIdle = locale === "zh" ? "按 Enter 提交答案。" : "Press Enter to submit.";
  const [answer, setAnswer] = useState("");
  const [hp, setHp] = useState(MAX_HP);
  const [score, setScore] = useState(0);
  const [completedWaves, setCompletedWaves] = useState(0);
  const [enemyProgress, setEnemyProgress] = useState(0);
  const [feedback, setFeedback] = useState(initialIdle);
  const [feedbackTone, setFeedbackTone] = useState<"ok" | "bad" | "warn">("warn");
  const [showPause, setShowPause] = useState(false);
  const [showCritical, setShowCritical] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [wrongWords, setWrongWords] = useState<WordEntry[]>([]);

  const question = questions[Math.min(completedWaves, TOTAL_WAVES - 1)];

  const t = useMemo(
    () =>
      locale === "zh"
        ? {
            discipline: "学科", hp: "生命值", score: "分数", wave: "波次", pause: "暂停", settings: "设置", exit: "退出",
            core: "Knowledge Core", adv: "敌人推进中", answerArea: "作答区", enter: "按 Enter 提交", attack: "攻击",
            placeholderSpell: "输入完整单词...", placeholderMeaning: "输入选项编号（例如 2）...",
            spellMode: "拼写模式", meaningMode: "释义模式", spellHint: "输入完整单词来击败怪物。", meaningHint: "输入正确选项编号（1-4）。",
            idle: "按 Enter 提交答案。", empty: "先输入答案再攻击。", ok: "命中！怪物被击退。", bad: "回答错误，护盾受损。", timeout: "怪物突破防线，护盾受损。",
            pauseTitle: "战斗已暂停", pauseDesc: "战场已冻结，准备好后继续，或返回主页。", resume: "继续", home: "返回主页",
            criticalTitle: "SYSTEM CRITICAL", criticalDesc: "核心受损，需要紧急词汇恢复后再继续战斗。", recovery: "开始恢复",
            reviewTitle: "WORD REVIEW", meaning: "词义", examples: "例句", next: "下一词", back: "返回防守", reviewHint: "复习该词后继续。", reviewDone: "复习完成，核心护盾已恢复。",
            victoryWord: "VICTORY", victoryHint: "全部波次已完成，防守成功！", settingsSoon: "设置面板将在后续版本开放。",
          }
        : {
            discipline: "Discipline", hp: "HP", score: "Score", wave: "Wave", pause: "Pause", settings: "Settings", exit: "Exit",
            core: "Knowledge Core", adv: "Enemy Advancing", answerArea: "Answer Area", enter: "Press Enter To Submit", attack: "Attack",
            placeholderSpell: "Type the full word here...", placeholderMeaning: "Type option number (e.g. 2)...",
            spellMode: "Spelling Mode", meaningMode: "Meaning Mode", spellHint: "Retype the complete word to defeat the monster.", meaningHint: "Type the correct option number (1-4).",
            idle: "Press Enter to submit.", empty: "Type an answer before attacking.", ok: "Direct hit! Enemy eliminated.", bad: "Wrong answer. Shield damaged.", timeout: "Enemy breached the core. Shield damaged.",
            pauseTitle: "Battle Paused", pauseDesc: "The battlefield is frozen. Resume when ready, or return home.", resume: "Resume", home: "Return Home",
            criticalTitle: "SYSTEM CRITICAL", criticalDesc: "Core breached. Emergency review is required.", recovery: "Start Recovery",
            reviewTitle: "WORD REVIEW", meaning: "Meaning", examples: "Examples", next: "Next Word", back: "Return to Defense", reviewHint: "Review this word and continue.", reviewDone: "Review complete. Core shield restored.",
            victoryWord: "VICTORY", victoryHint: "All waves cleared. Defense successful!", settingsSoon: "Settings panel will be available later.",
          },
    [locale],
  );
  const rememberWrong = useCallback((entry: WordEntry) => {
    setWrongWords((prev) => (prev.some((item) => item.word === entry.word) ? prev : [...prev, entry].slice(-8)));
  }, []);

  const openRecoveryPage = useCallback(
    (source: "critical" | "victory") => {
      const sourceQueue = source === "critical" ? [...wrongWords, ...questions.map((q) => q.entry)] : [...wrongWords, ...questions.map((q) => q.entry).slice(0, 2)];
      const queue = sourceQueue
        .filter((entry, index, arr) => arr.findIndex((item) => item.word === entry.word) === index)
        .slice(0, 3);

      const safeQueue = queue.length > 0 ? queue : questions.slice(0, 3).map((q) => q.entry);
      const encodedQueue = encodeURIComponent(JSON.stringify(safeQueue));
      router.push(`/games/word-game/recovery?lang=${locale}&bank=${bank}&source=${source}&queue=${encodedQueue}`);
    },
    [bank, locale, questions, router, wrongWords],
  );

  const advanceWave = useCallback(() => {
    setCompletedWaves((prev) => {
      const next = Math.min(prev + 1, TOTAL_WAVES);
      if (next >= TOTAL_WAVES && prev < TOTAL_WAVES) {
        window.setTimeout(() => openRecoveryPage("victory"), 520);
      }
      return next;
    });
    setEnemyProgress(0);
    setAnswer("");
  }, [openRecoveryPage]);

  const applyDamage = useCallback(
    (msg: string, advanceAfter: boolean) => {
      setHp((prev) => {
        const nextHp = Math.max(0, prev - 1);
        if (nextHp <= 0) setShowCritical(true);
        if (nextHp > 0 && advanceAfter) advanceWave();
        return nextHp;
      });
      setFeedbackTone("bad");
      setFeedback(msg);
      setEnemyProgress(0);
      setAnswer("");
    },
    [advanceWave],
  );

  const battleActive = !showPause && !showCritical && !isResolving && hp > 0 && completedWaves < TOTAL_WAVES;

  useEffect(() => {
    if (!battleActive) return;
    const timer = window.setInterval(() => setEnemyProgress((prev) => Math.min(100, prev + 1.5)), 120);
    return () => window.clearInterval(timer);
  }, [battleActive]);

  useEffect(() => {
    if (!battleActive || enemyProgress < 100 || !question) return;
    const timer = window.setTimeout(() => {
      rememberWrong(question.entry);
      applyDamage(t.timeout, true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applyDamage, battleActive, enemyProgress, question, rememberWrong, t.timeout]);

  const submit = useCallback(() => {
    if (!question || completedWaves >= TOTAL_WAVES) return;
    const normalized = answer.trim().toLowerCase();
    if (!normalized) {
      setFeedbackTone("warn");
      setFeedback(t.empty);
      return;
    }

    let correct = false;
    if (question.type === "spell") {
      correct = normalized === question.entry.word.toLowerCase();
    } else {
      const idx = question.correctOptionIndex + 1;
      const en = question.options[question.correctOptionIndex].meaningEn.toLowerCase();
      const zh = question.options[question.correctOptionIndex].meaningZh.toLowerCase();
      correct = normalized === String(idx) || normalized === `${idx}.` || normalized === en || normalized === zh;
    }

    if (correct) {
      setIsResolving(true);
      setFeedbackTone("ok");
      setFeedback(t.ok);
      setScore((prev) => prev + 150 + Math.max(0, 5 - Math.floor(enemyProgress / 20)) * 20);
      window.setTimeout(() => {
        advanceWave();
        setIsResolving(false);
      }, 380);
      return;
    }

    rememberWrong(question.entry);
    applyDamage(t.bad, false);
  }, [advanceWave, answer, applyDamage, completedWaves, enemyProgress, question, rememberWrong, t.bad, t.empty, t.ok]);

  const openRecovery = useCallback(() => {
    setShowCritical(false);
    setHp((prev) => Math.max(prev, RECOVER_HP));
    openRecoveryPage("critical");
  }, [openRecoveryPage]);

  const enemyLeft = Math.max(24, 74 - enemyProgress * 0.5);

  return (
    <div className="word-battle-root" data-page="battle">
      <main className="scene">
        <section className="top-hud">
          <div className="hud-card discipline-card"><span>{t.discipline}</span><strong id="sDis">{BANK_LABELS[bank] ?? BANK_LABELS.general}</strong></div>
          <div className="hud-card"><span>{t.hp}</span><strong id="sHp" className={hp <= 2 ? "red" : ""}>{hp} / {MAX_HP}</strong></div>
          <div className="hud-card"><span>{t.score}</span><strong id="sScore">{score}</strong></div>
          <div className="hud-card"><span>{t.wave}</span><strong id="sWave">{Math.min(completedWaves + 1, TOTAL_WAVES)}/{TOTAL_WAVES}</strong></div>
          <div className="system-controls" aria-label="System controls">
            <button id="pauseBattle" className="system-btn" type="button" onClick={() => setShowPause(true)}><span className="system-icon">II</span><span className="system-label">{t.pause}</span></button>
            <button id="openSettings" className="system-btn" type="button" onClick={() => { setFeedbackTone("warn"); setFeedback(t.settingsSoon); }}><span className="system-icon">⚙</span><span className="system-label">{t.settings}</span></button>
            <button id="exitBattle" className="system-btn exit-btn" type="button" onClick={() => router.push(`/games/word-game?lang=${locale}`)}><span className="system-icon">×</span><span className="system-label">{t.exit}</span></button>
          </div>
        </section>

        <section className="battle-wrap">
          <div className="sky-layer" />
          <div className="mountains" />
          <div className="ground" />
          <div className="battle-lane">
            <div className="tower-block"><div className="tower-top" /><div className="tower-core"><div className="stone-shadow" /></div><div className="gate-ring" /></div>
            <aside className="shield-plaque"><h2>{t.core}</h2><div className="shield-bar"><div id="shieldFill" style={{ width: `${(hp / MAX_HP) * 100}%` }} /></div><div id="shieldText">Shield {hp} / {MAX_HP}</div></aside>
            {question ? (
              <div id="enemy" className={`enemy ${question.type}`} style={{ left: `${enemyLeft}%` }}>
                <div className="enemy-body" /><div className="enemy-face"><div className="enemy-eye left" /><div className="enemy-eye right" /><div className="enemy-mouth" /></div>
                <div className="question-banner">
                  <div id="enemyType">{question.type === "spell" ? t.spellMode : t.meaningMode}</div>
                  <div id="enemyWord">{question.type === "spell" ? question.maskedWord : question.entry.word.toUpperCase()}</div>
                  <div id="enemyHint">{question.type === "spell" ? t.spellHint : t.meaningHint}</div>
                  <div id="enemyOptions">{question.type === "meaning" ? question.options.map((option, i) => <span className="enemy-option" key={`${option.word}-${i}`}>{i + 1}. {locale === "zh" ? option.meaningZh : option.meaningEn}</span>) : null}</div>
                </div>
              </div>
            ) : null}
            <div className="lane-progress"><div className="label">{t.adv}</div><div className="progress-track"><div id="enemyProg" style={{ width: `${enemyProgress}%` }} /></div></div>
          </div>
        </section>

        <section className="console-wrap">
          <div className="answer-board">
            <div className="answer-content">
              <div className="answer-head"><strong>{t.answerArea}</strong><span>{t.enter}</span></div>
              <form className="answer-input-row" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <input id="answer" type="text" autoComplete="off" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={question?.type === "meaning" ? t.placeholderMeaning : t.placeholderSpell} disabled={!battleActive} />
                <button id="submit" type="submit" disabled={!battleActive}>{t.attack}</button>
              </form>
              <div id="feedback" className={`feedback ${feedbackTone}`}>{feedback}</div>
            </div>
          </div>
        </section>
      </main>
      <div id="critical" style={{ display: showCritical ? "flex" : "none" }}>
        <section className="overlay-card"><div className="eyebrow">Emergency Warning</div><h2>SYSTEM CRITICAL</h2><p>Core breached. Emergency data recovery is required before combat can continue.</p><button id="goRecovery" type="button" onClick={openRecovery}>Start Recovery</button></section>
      </div>

      <div id="pauseOverlay" style={{ display: showPause ? "flex" : "none" }}>
        <section className="overlay-card"><div className="eyebrow">Battle Paused</div><h2>{t.pauseTitle}</h2><p>{t.pauseDesc}</p><div className="pause-actions"><button id="resumeBattle" type="button" onClick={() => setShowPause(false)}>{t.resume}</button><button id="leaveBattle" type="button" onClick={() => router.push(`/games/word-game?lang=${locale}`)}>{t.home}</button></div></section>
      </div>

      <style jsx global>{`
        .word-battle-root{min-height:100vh;font-family:"Trebuchet MS","Segoe UI",sans-serif;color:#fffef8;background:radial-gradient(circle at 50% 22%,rgba(255,255,255,.58),transparent 20%),linear-gradient(180deg,#7fd7e9 0%,#a6f0e4 58%,#d3ffd6 100%)}
        .word-battle-root *{box-sizing:border-box}.scene{width:min(1380px,calc(100vw - 40px));min-height:min(920px,calc(100vh - 28px));margin:14px auto;padding:14px;border-radius:34px;background:linear-gradient(180deg,rgba(110,94,176,.18),rgba(83,67,142,.08)),rgba(33,24,64,.18);display:grid;grid-template-rows:70px 1fr 186px;gap:24px}
        .top-hud{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding-right:286px}.hud-card{border-radius:22px;padding:12px 18px;background:linear-gradient(180deg,rgba(61,45,112,.94),rgba(47,33,88,.98));border:3px solid #251945;display:flex;flex-direction:column;justify-content:center}.hud-card span{font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(249,241,255,.74)}.hud-card strong{margin-top:4px;font-size:1.45rem;line-height:1.1}.discipline-card strong{font-size:1.12rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sHp.red{color:#ff626d}
        .system-controls{position:absolute;top:0;right:0;display:flex;gap:10px}.system-btn{min-width:84px;height:70px;border:3px solid #251945;border-radius:22px;background:linear-gradient(180deg,rgba(61,45,112,.94),rgba(47,33,88,.98));color:#fff1d3;display:inline-flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;cursor:pointer;font:inherit;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.exit-btn{background:linear-gradient(180deg,#d97d54,#a84e30)!important;border-color:#6f2d1e!important}
        .battle-wrap{position:relative;overflow:hidden;border-radius:30px;border:5px solid rgba(58,42,104,.76);background:linear-gradient(180deg,rgba(188,252,255,.28),rgba(90,141,202,.05) 40%,rgba(0,0,0,0) 41%),linear-gradient(180deg,rgba(98,126,220,.22),rgba(38,42,113,.06))}.sky-layer{position:absolute;inset:0 0 42% 0;background:radial-gradient(circle at 52% 20%,rgba(255,255,255,.6),transparent 12%),linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,0))}.mountains{position:absolute;left:0;right:0;bottom:30%;height:220px}.mountains:before,.mountains:after{content:"";position:absolute;inset:auto 0 0 0;height:100%}.mountains:before{clip-path:polygon(0% 100%,12% 48%,24% 100%,38% 38%,52% 100%,67% 42%,82% 100%,100% 52%,100% 100%);background:#94d8c8}.mountains:after{transform:translateY(46px);clip-path:polygon(0% 100%,10% 62%,24% 100%,41% 54%,56% 100%,74% 48%,89% 100%,100% 66%,100% 100%);background:#6bbb8d}.ground{position:absolute;left:-2%;right:-2%;bottom:-8%;height:40%;background:linear-gradient(180deg,#96d45a 0%,#73b246 50%,#406427 100%);clip-path:polygon(0 42%,12% 28%,23% 26%,38% 34%,50% 31%,60% 24%,72% 28%,82% 18%,100% 26%,100% 100%,0 100%)}
        .battle-lane{position:absolute;left:7%;right:6%;bottom:8%;top:10%}.tower-block{position:absolute;left:6%;bottom:17%;width:220px;height:290px}.tower-core{position:absolute;left:26px;right:26px;bottom:0;height:234px;background:linear-gradient(180deg,#d1c1a1 0%,#968a7a 44%,#786f68 100%);border:4px solid #4f4540;border-radius:28px 28px 22px 22px;clip-path:polygon(12% 0,88% 0,100% 100%,0 100%)}.tower-top{position:absolute;left:18px;right:18px;top:14px;height:82px;background:linear-gradient(180deg,#d7c8ab 0%,#9e8f7f 100%);border:4px solid #4f4540;border-radius:26px}.gate-ring{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);width:74px;height:92px;border-radius:40px 40px 18px 18px;border:5px solid #594b45;background:linear-gradient(180deg,#8a5638,#70402a)}
        .shield-plaque{position:absolute;left:4%;bottom:2%;width:240px;padding:14px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(61,45,112,.94),rgba(47,33,88,.98));border:3px solid #251945}.shield-bar{height:16px;border-radius:999px;overflow:hidden;background:rgba(18,13,38,.55)}#shieldFill{height:100%;background:linear-gradient(90deg,#8cf06a,#59bb42);transition:width .2s ease}
        .enemy{position:absolute;top:23%;width:128px;height:118px;z-index:3;transition:left .15s linear}.enemy-body{position:absolute;inset:0;border:4px solid #2e1b46;border-radius:48% 48% 42% 42%/44% 44% 52% 52%;background:linear-gradient(180deg,#5d3d91,#35205e 72%)}.enemy.meaning .enemy-body{background:linear-gradient(180deg,#6852ad,#3d2a73 72%)}.enemy-face{position:absolute;inset:0}.enemy-eye{position:absolute;top:38px;width:22px;height:18px;background:#e8b6ff;border-radius:60% 60% 50% 50%}.enemy-eye.left{left:28px;transform:rotate(-18deg)}.enemy-eye.right{right:28px;transform:rotate(18deg)}.enemy-mouth{position:absolute;left:50%;top:70px;transform:translateX(-50%);width:54px;height:24px;background:#241233;clip-path:polygon(0 0,100% 0,86% 38%,70% 18%,56% 60%,44% 18%,26% 52%,14% 14%)}
        .question-banner{position:absolute;left:62px;top:96px;width:330px;min-height:138px;padding:16px 18px 18px;border-radius:24px;background:linear-gradient(180deg,rgba(44,30,80,.96),rgba(28,18,55,.98));border:3px solid #3f2b69;color:#fff7ea}#enemyType{display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:rgba(240,203,105,.16);color:#f5cd69;font-size:.85rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}#enemyWord{margin-top:12px;font-size:2.15rem;font-weight:900;line-height:1.05}#enemyHint{margin-top:8px;font-size:.96rem;line-height:1.45;color:rgba(244,236,255,.84)}#enemyOptions{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px}.enemy-option{display:inline-flex;align-items:center;min-height:34px;padding:6px 12px;border-radius:999px;background:rgba(255,248,234,.09);border:1px solid rgba(255,248,234,.14);color:#fff6e2;font-size:.86rem;font-weight:800}
        .lane-progress{position:absolute;left:28%;right:16%;bottom:3%;z-index:2}.progress-track{height:18px;border-radius:999px;overflow:hidden;background:rgba(27,22,53,.44)}#enemyProg{height:100%;background:linear-gradient(90deg,#ffd573,#ff8b56,#e94c54);transition:width .1s linear}
        .answer-board{height:100%;border-radius:28px;padding:16px 18px 18px;background:linear-gradient(180deg,#f0d9ad 0%,#d7b98d 58%,#b07d53 100%);border:4px solid #6e472f}.answer-content{height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:12px}.answer-head{display:flex;justify-content:space-between;align-items:center;color:#55341f;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.answer-input-row{display:grid;grid-template-columns:1fr 126px;gap:12px;align-items:center}#answer{height:56px;border-radius:14px;border:3px solid rgba(97,61,35,.46);background:linear-gradient(180deg,#fffef9,#f3efe6);color:#2c2017;font-size:1.08rem;font-weight:700;padding:0 18px;outline:none}#submit{height:56px;border-radius:14px;border:3px solid #6f2d1e;background:linear-gradient(180deg,#d97d54,#a84e30);color:#fffef8;font-size:1rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}#submit:disabled,#answer:disabled{opacity:.6;cursor:not-allowed}.feedback{min-height:24px;font-size:.95rem;font-weight:800;display:flex;align-items:center;color:#61452d}.feedback.ok{color:#2d7a28}.feedback.bad{color:#9a2923}.feedback.warn{color:#8f5c14}
        #critical,#pauseOverlay,#recoveryOverlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);z-index:20}#critical{background:rgba(34,12,19,.72)}#pauseOverlay{background:rgba(20,18,36,.58);z-index:19}#recoveryOverlay{background:rgba(18,24,34,.58);z-index:21}.overlay-card{width:min(520px,calc(100vw - 32px));padding:28px 26px 24px;border-radius:28px;background:linear-gradient(180deg,#f3dec0 0%,#d2ae84 100%);border:4px solid #6c4128;box-shadow:inset 0 3px 0 rgba(255,251,232,.6),0 18px 0 rgba(85,54,34,.28);color:#33231a;text-align:center}.overlay-card .eyebrow{font-size:.88rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#9a3b36}.overlay-card h2{margin:12px 0 10px;font-size:2.2rem;line-height:1}.overlay-card p{margin:0 0 20px;color:rgba(51,35,26,.78);line-height:1.6}.pause-actions,.m-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:10px}#goRecovery,#resumeBattle,#mNext,#mReturn,#leaveBattle{height:52px;min-width:190px;border-radius:14px;font:inherit;font-weight:900;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}#goRecovery,#resumeBattle,#mNext,#mReturn{border:3px solid #6f2d1e;background:linear-gradient(180deg,#d97d54,#a84e30);color:#fffef8;box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -5px 0 rgba(109,41,25,.36),0 6px 0 rgba(109,41,25,.38)}#leaveBattle{border:3px solid #251945;background:linear-gradient(180deg,rgba(61,45,112,.94),rgba(47,33,88,.98));color:#fff1d3}
        .review-modal{width:min(920px,calc(100vw - 30px));max-height:calc(100vh - 40px);overflow:auto;border-radius:26px;padding:22px;background:#f9f4e8;border:2px solid #e2d7c1;color:#3b2f26}.review-modal.is-done .review-top,.review-modal.is-done #mReviewBody{display:none}.review-top{display:flex;align-items:center;justify-content:space-between;color:#8f9276;font-size:1.02rem}#mWord{margin:8px 0 12px;text-align:center;font-size:clamp(3rem,8vw,5rem);font-weight:900;color:#9aaf2e}#mReviewBody{display:grid;gap:14px}.m-pron-row{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}.m-pron{display:inline-flex;align-items:center;gap:8px;font-size:.88rem;color:#6f695f;background:rgba(255,255,255,.5);border-radius:14px;padding:4px 10px 4px 6px}.m-speak{width:24px;height:24px;border:none;border-radius:50%;background:#9aaf2e;color:#fffef8;cursor:pointer}.m-section h3{margin:0 0 8px;color:#4a4037;font-size:1.2rem;font-weight:900}#mMeaning,#mExamples{border-radius:14px;background:#fff;border:1px solid rgba(140,131,119,.2);padding:14px 16px}#mExamples{display:grid;gap:12px}.m-ex{padding-bottom:10px;border-bottom:1px dashed rgba(150,140,126,.4)}.m-ex:last-child{border-bottom:none;padding-bottom:0}.m-ex-en{margin:0;color:#2f2721}.m-ex-zh{margin:4px 0 0;color:#7a736b}#mFeedback{min-height:22px;text-align:center;color:#7d7468;font-size:.92rem;font-weight:700}
        @media (max-width:1180px){.scene{width:calc(100vw - 24px);min-height:calc(100vh - 24px);grid-template-rows:auto minmax(420px,1fr) 210px}.top-hud{grid-template-columns:repeat(2,minmax(0,1fr));padding-right:0}.system-controls{position:static;grid-column:1 / -1;justify-content:flex-end}}
        @media (max-width:860px){.scene{width:calc(100vw - 16px);margin:8px auto;padding:10px;grid-template-rows:auto 560px 224px}.top-hud{grid-template-columns:1fr;gap:8px}.system-controls{position:static;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.battle-lane{left:3%;right:3%;top:8%}.tower-block{left:-2%;bottom:20%;transform:scale(.72);transform-origin:bottom left}.question-banner{left:34px;width:240px}.answer-input-row{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
