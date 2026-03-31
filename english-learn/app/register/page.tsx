"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [lang, setLang] = useState<"zh" | "en">("en");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const copy = {
    zh: {
      brand: "English Learn",
      langLabel: "网站语言",
      badge: "ENGLISH LEARN",
      title: "创建你的学习账号。",
      subtitle: "从这里开始，进入更清晰的英语学习路径。",
      panelKicker: "CREATE ACCOUNT",
      panelTitle: "注册。",
      panelDesc: "填写基础信息，开始你的学习节奏。",
      username: "账号",
      email: "邮箱",
      password: "密码",
      confirmPassword: "确认密码",
      register: "注册",
      toLogin: "已有账号？去登录",
      feature1Title: "Clear entry",
      feature1Text: "从注册开始，建立你的专属学习入口。",
      feature2Title: "Personal route",
      feature2Text: "根据能力与目标进入更适合你的路径。",
      feature3Title: "Steady growth",
      feature3Text: "保持稳定、清晰、可持续的学习体验。",
      footerNote: "Quiet design. Clear route.",
      passwordMismatch: "两次输入的密码不一致",
      registerLoading: "注册中...",
      registerFailed: "注册失败，请稍后再试",
    },
    en: {
      brand: "English Learn",
      langLabel: "Language",
      badge: "ENGLISH LEARN",
      title: "Create your learner account.",
      subtitle: "Start here, then move into a clearer English learning route.",
      panelKicker: "CREATE ACCOUNT",
      panelTitle: "Sign up.",
      panelDesc: "Enter your details and begin your learning rhythm.",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      register: "Create account",
      toLogin: "Already have an account? Log in",
      feature1Title: "Clear entry",
      feature1Text: "Start with a simple account foundation.",
      feature2Title: "Personal route",
      feature2Text: "Move into a path that fits your level and goals.",
      feature3Title: "Steady growth",
      feature3Text: "A calmer structure for consistent learning.",
      footerNote: "Quiet design. Clear route.",
      passwordMismatch: "Passwords do not match",
      registerLoading: "Creating account...",
      registerFailed: "Unable to create account. Please try again.",
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setLoading(false);
      setError(copy.passwordMismatch);
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        user_id?: string;
        auth_provider?: string;
        user?: {
          username: string;
          email: string;
        };
      };

      if (!response.ok) {
        setLoading(false);
        setError(data.error || copy.registerFailed);
        return;
      }

      localStorage.setItem("demo_logged_in", "true");
      localStorage.setItem("demo_user", data.user?.username || data.user?.email || username.trim());
      if (data.user_id) {
        localStorage.setItem("demo_auth_user_id", data.user_id);
      }
      localStorage.setItem("demo_auth_provider", data.auth_provider || "local-file");
      window.dispatchEvent(new Event("demo-auth-changed"));
      window.location.href = "/dashboard";
    } catch {
      setLoading(false);
      setError(copy.registerFailed);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#f3efe6] text-[#22314d]"
    >
      <div
        className="min-h-screen"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,49,77,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,49,77,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-5 py-5 lg:px-8 lg:py-6">
          <header className="mb-6 flex items-center justify-between rounded-[28px] border border-white/50 bg-white/60 px-5 py-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur md:px-7">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22314d] text-white shadow-sm">
                <span className="text-sm font-semibold tracking-[0.18em]">
                  EL
                </span>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#f8f5ef] bg-[#d8c39a]" />
              </div>

              <span className="text-[24px] font-semibold tracking-tight text-[#22314d]">
                {copy.brand}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="hidden sm:inline">{copy.langLabel}</span>
              <div className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setLang("zh")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    lang === "zh"
                      ? "bg-[#22314d] text-white"
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
                      ? "bg-[#22314d] text-white"
                      : "text-slate-500"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </header>

          <section className="grid min-h-[calc(100vh-118px)] grid-cols-1 gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative overflow-hidden rounded-[36px] border border-white/50 bg-[#f8f5ef] p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:p-10">
              <div className="absolute right-[-60px] top-[-60px] h-52 w-52 rounded-full bg-white/55 blur-2xl" />
              <div className="absolute bottom-[-70px] left-[-40px] h-56 w-56 rounded-full bg-[#e9e3d6]/70 blur-2xl" />

              <div className="relative z-10 max-w-[760px]">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-slate-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#22314d]" />
                  {copy.badge}
                </div>

                <div className="mb-8 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#22314d] text-white shadow-sm">
                    <span className="text-lg font-semibold tracking-[0.22em]">
                      EL
                    </span>
                    <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-[#f8f5ef] bg-[#d8c39a]" />
                  </div>

                  <div className="text-sm leading-6 text-slate-500">
                    <div className="font-medium text-[#22314d]">English Learn</div>
                    <div>{copy.footerNote}</div>
                  </div>
                </div>

                <h1
                  className="font-display max-w-[760px] text-[46px] leading-[1.05] tracking-[-0.035em] text-[#1f2b43] md:text-[62px] lg:text-[74px]"
                >
                  {copy.title}
                </h1>

                <p className="mt-5 max-w-[560px] text-lg leading-8 text-slate-500">
                  {copy.subtitle}
                </p>

                <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
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

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/login"
                    className="rounded-full bg-[#22314d] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px]"
                  >
                    {lang === "zh" ? "返回登录" : "Back to login"}
                  </Link>

                  <button
                    type="button"
                    className="rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#22314d] transition hover:bg-white"
                  >
                    {lang === "zh" ? "查看模块" : "View modules"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[36px] bg-[linear-gradient(180deg,#22314d_0%,#1c2740_100%)] p-7 text-white shadow-[0_24px_55px_rgba(15,23,42,0.18)] lg:p-8">
              <div className="mb-8">
                <div className="text-[11px] font-semibold tracking-[0.24em] text-[#d9c59f]">
                  {copy.panelKicker}
                </div>

                <h2
                  className="font-display mt-5 text-[40px] leading-none tracking-[-0.03em] text-white md:text-[52px]"
                >
                  {copy.panelTitle}
                </h2>

                <p className="mt-4 max-w-[460px] text-base leading-8 text-slate-300">
                  {copy.panelDesc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  label={copy.username}
                  type="text"
                  value={username}
                  onChange={setUsername}
                />

                <Field
                  label={copy.email}
                  type="email"
                  value={email}
                  onChange={setEmail}
                />

                <Field
                  label={copy.password}
                  type="password"
                  value={password}
                  onChange={setPassword}
                />

                <Field
                  label={copy.confirmPassword}
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                {error ? (
                  <div className="rounded-[20px] border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center rounded-[22px] bg-white text-base font-semibold text-[#22314d] transition hover:translate-y-[-1px] hover:bg-[#f8f5ef] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? copy.registerLoading : copy.register}
                  </button>

                  <Link
                    href="/login"
                    className="mt-4 flex h-14 w-full items-center justify-center rounded-[22px] border border-white/15 bg-white/5 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    {copy.toLogin}
                  </Link>
                </div>
              </form>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-white">
                    {lang === "zh" ? "New learner" : "New learner"}
                  </div>
                  <span className="rounded-full border border-[#9d8a61] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-[#e4d2ab]">
                    MVP
                  </span>
                </div>

                <p className="text-[15px] leading-7 text-slate-300">
                  {lang === "zh"
                    ? "从创建账号开始，进入属于你的学习路径。"
                    : "Create an account, then move into your own learning route."}
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
    <div className="rounded-[28px] border border-slate-200 bg-[#fcfbf8] p-5 shadow-sm">
      <div className="mb-3 text-[11px] font-semibold tracking-[0.24em] text-slate-500">
        {title.toUpperCase()}
      </div>
      <p className="text-[15px] leading-7 text-slate-600">{text}</p>
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
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="h-11 w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
      />
    </div>
  );
}
