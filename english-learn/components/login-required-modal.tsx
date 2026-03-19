"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LoginRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  locale?: string;
};

export function LoginRequiredModal({
  open,
  onClose,
  locale = "en",
}: LoginRequiredModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const isZh = locale === "zh";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-[#f8f5ef] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.14)] bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          <span className="inline-block size-2 rounded-full bg-[var(--navy)]" />
          English Learn
        </div>

        <h3 className="font-display mt-5 text-3xl tracking-tight text-[var(--ink)]">
          {isZh ? "请先登录" : "Log in required"}
        </h3>

        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          {isZh
            ? "这个功能需要登录后才能使用。登录后你可以开始测评、学习和查看个人进度。"
            : "This feature is available after sign-in. Log in to start tests, study modules, and view your progress."}
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/login?lang=${locale}`}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[var(--navy)] px-5 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px]"
          >
            {isZh ? "前往登录" : "Go to login"}
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.04)]"
          >
            {isZh ? "取消" : "Cancel"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}