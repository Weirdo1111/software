"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthLandingHero } from "@/components/forms/auth-landing-hero";

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
      brand: "DIICSU English Hub",
      brandSub: "DUNDEE INTERNATIONAL INSTITUTE OF CENTRAL SOUTH UNIVERSITY",
      langLabel: "网站语言",
      badge: "DIICSU FRESHMAN ENGLISH HUB",
      title: "创建你的 DIICSU 新生学习账号。",
      panelKicker: "CREATE DIICSU ACCOUNT",
      panelTitle: "创建账号。",
      panelDesc: "填写基础信息，开启你的 DIICSU 新生英语学习路径。",
      username: "账号",
      email: "邮箱",
      password: "密码",
      confirmPassword: "确认密码",
      register: "注册",
      toLogin: "已有账号？去登录",
      accountCardTitle: "Freshman account",
      accountCardText: "以后用同一个账号登录，就能继续保留学习进度、桌宠成长和反馈记录。",
      passwordMismatch: "两次输入的密码不一致",
      registerLoading: "注册中...",
      registerFailed: "注册失败，请稍后再试",
    },
    en: {
      brand: "DIICSU English Hub",
      brandSub: "DUNDEE INTERNATIONAL INSTITUTE OF CENTRAL SOUTH UNIVERSITY",
      langLabel: "Language",
      badge: "DIICSU FRESHMAN ENGLISH HUB",
      title: "Create your DIICSU freshman account.",
      panelKicker: "CREATE DIICSU ACCOUNT",
      panelTitle: "Sign up.",
      panelDesc: "Enter your details and begin a DIICSU-first study route.",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      register: "Create account",
      toLogin: "Already have an account? Log in",
      accountCardTitle: "Freshman account",
      accountCardText: "Use the same account next time to keep your study progress, buddy growth, and feedback records together.",
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

              <div>
                <div className="text-[24px] font-semibold tracking-tight text-[#22314d]">{copy.brand}</div>
                <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:block">{copy.brandSub}</div>
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

          <section className="grid min-h-[calc(100vh-118px)] items-stretch grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative flex h-full overflow-hidden rounded-[36px] border-2 border-white/80 bg-[linear-gradient(165deg,rgba(255,255,255,0.96),rgba(236,246,255,0.92),rgba(255,243,249,0.86))] p-7 shadow-[0_14px_0_rgba(143,196,255,0.18),0_22px_48px_rgba(90,123,255,0.12)] lg:p-10">
              <div className="absolute right-[-60px] top-[-60px] h-52 w-52 rounded-full bg-[#dff2ff]/80 blur-2xl" />
              <div className="absolute bottom-[-70px] left-[-40px] h-56 w-56 rounded-full bg-[#ffe8f2]/65 blur-2xl" />

              <AuthLandingHero
                badge={copy.badge}
                title={copy.title}
              />
            </div>

            <div className="flex h-full flex-col rounded-[36px] border-2 border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(239,247,255,0.92)_48%,rgba(248,243,255,0.9)_100%)] p-6 text-[#22314d] shadow-[0_14px_0_rgba(143,196,255,0.18),0_24px_55px_rgba(90,123,255,0.14)] backdrop-blur lg:p-7">
              <div className="mb-6">
                <div className="text-[11px] font-semibold tracking-[0.24em] text-[#6f7fa5]">
                  {copy.panelKicker}
                </div>

                <h2
                  className="font-display mt-4 text-[36px] leading-none tracking-[-0.03em] text-[#22314d] md:text-[46px]"
                >
                  {copy.panelTitle}
                </h2>

                <p className="mt-3 max-w-[420px] text-[15px] leading-7 text-slate-500">
                  {copy.panelDesc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
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
                  <div className="rounded-[20px] border border-red-200 bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm text-[#c36d59]">
                    {error}
                  </div>
                ) : null}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#5a7bff,#4ad2ff)] text-base font-semibold text-white shadow-[0_10px_0_rgba(143,196,255,0.24)] transition hover:translate-y-[-1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? copy.registerLoading : copy.register}
                  </button>

                  <Link
                    href="/login"
                    className="mt-3 flex h-14 w-full items-center justify-center rounded-[22px] border-2 border-[rgba(90,123,255,0.16)] bg-white/82 text-base font-semibold text-[#22314d] transition hover:bg-white"
                  >
                    {copy.toLogin}
                  </Link>
                </div>
              </form>

              <div className="mt-auto pt-6">
                <div className="rounded-[26px] border-2 border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(239,247,255,0.82))] p-4 shadow-[0_10px_0_rgba(143,196,255,0.14)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold text-[#22314d]">
                      {copy.accountCardTitle}
                    </div>
                    <span className="rounded-full border border-[#ffd98a] bg-[#fff7da] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-[#8c6810]">
                      DIICSU
                    </span>
                  </div>

                  <p className="text-[15px] leading-7 text-slate-500">
                    {copy.accountCardText}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
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
    <div className="rounded-[22px] border-2 border-white/80 bg-white/82 p-3.5 shadow-[0_8px_0_rgba(143,196,255,0.12)] backdrop-blur-sm">
      <label className="mb-1.5 block text-sm font-medium text-[#5f6f90]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="h-10.5 w-full bg-transparent text-base text-[#22314d] outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
