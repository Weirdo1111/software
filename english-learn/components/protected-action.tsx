"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequiredModal } from "@/components/login-required-modal";
import { startNavigationLoading } from "@/lib/navigation-loading";

type ProtectedActionProps = {
  href?: string;
  locale: string;
  isLoggedIn?: boolean;
  className?: string;
  children: ReactNode;
  onAllowedClick?: () => void;
};

export function ProtectedAction({
  href,
  locale,
  isLoggedIn = false,
  className = "",
  children,
  onAllowedClick,
}: ProtectedActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!isLoggedIn) {
      setOpen(true);
      return;
    }

    if (onAllowedClick) {
      onAllowedClick();
      return;
    }

    if (href) {
      startNavigationLoading(href);
      router.push(href);
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>

      <LoginRequiredModal
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
      />
    </>
  );
}
