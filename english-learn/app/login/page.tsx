"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [lang, setLang] = useState<"zh" | "en">("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const copy = {
    zh: {
      brand: "English Learn",
      langLabel: "网站语言",
      badge: "ENGLISH LEARN",
      title: "更清晰地学英语。",
      subtitle: "先评估，再稳步进步。",
      panelKicker: "REGISTRATION AND LOGIN",
      panelTitle: "欢迎回来。",
      panelDesc: "登录后继续你的学习路径与每日任务。",
      email: "账号 / 邮箱",
      password: "密码",
      login: "登录",
      loginLoading: "登录中...",
      register: "注册",
      forgot: "忘记密码？",
      feature1Title: "Assessment-first",
      feature1Text: "从评估开始，进入更适合你的学习路线。",
      feature2Title: "Four skills",
      feature2Text: "围绕听、说、读、写建立持续提升。",
      feature3Title: "Steady progress",
      feature3Text: "用更清晰的节奏与反馈保持成长。",
      footerNote: "Quiet design. Clear route.",
      invalid: "账号或密码错误",
      accessTitle: "Learner access",
      accessText: "从登录开始，进入属于你的学习节奏。",
    },
    en: {
      brand: "English Learn",
      langLabel: "Language",
      badge: "ENGLISH LEARN",
      title: "Learn with clarity.",
      subtitle: "Assessment first. Then steady progress.",
      panelKicker: "REGISTRATION AND LOGIN",
      panelTitle: "Welcome back.",
      panelDesc: "Sign in to continue your learner route and daily study flow.",
      email: "Email / Account",
      password: "Password",
      login: "Log in",
      loginLoading: "Signing in...",
      register: "Sign up",
      forgot: "Forgot password?",
      feature1Title: "Assessment-first",
      feature1Text: "Start with evaluation, then move into the right route.",
      feature2Title: "Four skills",
      feature2Text: "Build across listening, speaking, reading, and writing.",
      feature3Title: "Steady progress",
      feature3Text: "A calmer structure for consistent improvement.",
      footerNote: "Quiet design. Clear route.",
      invalid: "Invalid account or password",
      accessTitle: "Learner access",
      accessText: "Start here, then move into your own learning rhythm.",
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        user_id?: string;
        auth_provider?: string;
        user?: {
          email: string;
          username: string;
        };
      };

      if (!response.ok) {
        setLoading(false);
        setError(data.error || copy.invalid);
        return;
      }

      localStorage.setItem("demo_logged_in", "true");
      localStorage.setItem("demo_user", data.user?.username || data.user?.email || email.trim());
      if (data.user_id) {
        localStorage.setItem("demo_auth_user_id", data.user_id);
      }
      localStorage.setItem("demo_auth_provider", data.auth_provider || "local-file");
      window.dispatchEvent(new Event("demo-auth-changed"));
      window.location.href = "/dashboard";
      return;
    } catch {
      setLoading(false);
      setError(copy.invalid);
    }
  };

  return (
    <main
      className="min-h-screen bg-[linear-gradient(180deg,#dff1ff_0%,#eef7ff_34%,#f7fbff_72%,#fff9fb_100%)] text-[#22314d]"
    >
      <div
        className="min-h-screen"
        style={{
          backgroundImage: `
            linear-gradient(rgba(90,123,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(90,123,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-5 py-5 lg:px-8 lg:py-6">
          <header className="mb-6 flex items-center justify-between rounded-[28px] border-2 border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,247,255,0.86),rgba(255,245,250,0.82))] px-5 py-4 shadow-[0_12px_0_rgba(143,196,255,0.14),0_18px_36px_rgba(90,123,255,0.1)] backdrop-blur md:px-7">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5a7bff,#4ad2ff)] text-white shadow-[0_8px_0_rgba(143,196,255,0.24)]">
                <span className="text-sm font-semibold tracking-[0.18em]">
                  EL
                </span>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#f6fbff] bg-[#ffd774]" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-semibold tracking-tight text-[#22314d]">
                  {copy.brand}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="hidden sm:inline">{copy.langLabel}</span>
              <div className="flex rounded-full border border-white/80 bg-white/82 p-1 shadow-[0_8px_18px_rgba(90,123,255,0.08)]">
                <button
                  type="button"
                  onClick={() => setLang("zh")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    lang === "zh"
                      ? "bg-[linear-gradient(135deg,#5a7bff,#4ad2ff)] text-white"
                      : "text-slate-500"
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    lang === "en"
                      ? "bg-[linear-gradient(135deg,#5a7bff,#4ad2ff)] text-white"
                      : "text-slate-500"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </header>

          <section className="grid min-h-[calc(100vh-118px)] grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[36px] border-2 border-white/80 bg-[linear-gradient(165deg,rgba(255,255,255,0.96),rgba(236,246,255,0.92),rgba(255,243,249,0.86))] p-7 shadow-[0_14px_0_rgba(143,196,255,0.18),0_22px_48px_rgba(90,123,255,0.12)] lg:p-10">
              <div className="absolute right-[-60px] top-[-60px] h-52 w-52 rounded-full bg-[#dff2ff]/80 blur-2xl" />
              <div className="absolute bottom-[-70px] left-[-40px] h-56 w-56 rounded-full bg-[#ffe8f2]/65 blur-2xl" />

              <div className="relative z-10 flex h-full max-w-[840px] flex-col">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/88 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-slate-500 shadow-[0_8px_18px_rgba(90,123,255,0.08)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#5a7bff]" />
                  {copy.badge}
                </div>

                <div className="mb-8 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#5a7bff,#4ad2ff)] text-white shadow-[0_10px_0_rgba(143,196,255,0.24)]">
                    <span className="text-lg font-semibold tracking-[0.22em]">
                      EL
                    </span>
                    <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-[#f6fbff] bg-[#ffd774]" />
                  </div>

                  <div className="text-sm leading-6 text-slate-500">
                    <div className="font-medium text-[#22314d]">
                      English Learn
                    </div>
                    <div>{copy.footerNote}</div>
                  </div>
                </div>

                <h1
                  className="font-display max-w-[820px] text-[52px] leading-[1.02] tracking-[-0.04em] text-[#1f2b43] md:text-[68px] lg:text-[86px]"
                >
                  {copy.title}
                </h1>

                <p className="mt-6 max-w-[660px] text-[19px] leading-9 text-slate-500">
                  {copy.subtitle}
                </p>

                <div className="mt-auto grid grid-cols-1 gap-5 pt-14 md:grid-cols-3">
                  <FeatureCard
                    title={copy.feature1Title}
                    text={copy.feature1Text}
                  />
                  <FeatureCard
                    title={copy.feature2Title}
                    text={copy.feature2Text}
                  />
                  <FeatureCard
                    title={copy.feature3Title}
                    text={copy.feature3Text}
                  />
                </div>

              </div>
            </div>

            <div className="rounded-[36px] border-2 border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(239,247,255,0.92)_48%,rgba(248,243,255,0.9)_100%)] p-7 text-[#22314d] shadow-[0_14px_0_rgba(143,196,255,0.18),0_24px_55px_rgba(90,123,255,0.14)] backdrop-blur lg:p-8">
              <div className="mb-8">
                <div className="text-[11px] font-semibold tracking-[0.24em] text-[#6f7fa5]">
                  {copy.panelKicker}
                </div>

                <h2
                  className="font-display mt-5 text-[40px] leading-none tracking-[-0.03em] text-[#22314d] md:text-[52px]"
                >
                  {copy.panelTitle}
                </h2>

                <p className="mt-4 max-w-[460px] text-base leading-8 text-slate-500">
                  {copy.panelDesc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  label={copy.email}
                  type="text"
                  value={email}
                  onChange={setEmail}
                />

                <Field
                  label={copy.password}
                  type="password"
                  value={password}
                  onChange={setPassword}
                />

                {error ? (
                  <div className="rounded-[20px] border border-red-200 bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm text-[#c36d59]">
                    {error}
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#5a7bff,#4ad2ff)] text-base font-semibold text-white shadow-[0_10px_0_rgba(143,196,255,0.24)] transition hover:translate-y-[-1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? copy.loginLoading : copy.login}
                  </button>

                  <Link
                    href="/register"
                    className="mt-4 flex h-14 w-full items-center justify-center rounded-[22px] border-2 border-[rgba(90,123,255,0.16)] bg-white/82 text-base font-semibold text-[#22314d] transition hover:bg-white"
                  >
                    {copy.register}
                  </Link>
                </div>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    className="text-sm text-slate-500 transition hover:text-[#22314d]"
                  >
                    {copy.forgot}
                  </button>
                </div>
              </form>

              <div className="mt-8 rounded-[28px] border-2 border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(239,247,255,0.82))] p-5 shadow-[0_10px_0_rgba(143,196,255,0.14)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-[#22314d]">
                    {copy.accessTitle}
                  </div>
                  <span className="rounded-full border border-[#ffd98a] bg-[#fff7da] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-[#8c6810]">
                    MVP
                  </span>
                </div>

                <p className="text-[15px] leading-7 text-slate-500">
                  {copy.accessText}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[30px] border-2 border-white/85 bg-[linear-gradient(165deg,rgba(255,255,255,0.96),rgba(239,247,255,0.9),rgba(255,245,250,0.84))] p-6 shadow-[0_10px_0_rgba(143,196,255,0.14),0_18px_28px_rgba(90,123,255,0.08)]">
      <div className="mb-3 text-[11px] font-semibold tracking-[0.24em] text-[#6f7fa5]">
        {title.toUpperCase()}
      </div>
      <p className="text-[16px] leading-8 text-slate-600">{text}</p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[24px] border-2 border-white/80 bg-white/82 p-4 shadow-[0_8px_0_rgba(143,196,255,0.12)] backdrop-blur-sm">
      <label className="mb-2 block text-sm font-medium text-[#5f6f90]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="h-11 w-full bg-transparent text-base text-[#22314d] outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
