"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BuddyCompanion } from "@/components/home/buddy-companion";
import { getNavigationLoadingEventName, startNavigationLoading } from "@/lib/navigation-loading";

const MIN_VISIBLE_MS = 420;
const MAX_VISIBLE_MS = 12000;

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function isInternalNavigableAnchor(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return true;
  } catch {
    return false;
  }
}

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);
  const hideTimerRef = useRef<number | null>(null);
  const forceHideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (forceHideTimerRef.current) {
        window.clearTimeout(forceHideTimerRef.current);
        forceHideTimerRef.current = null;
      }
    };

    const show = () => {
      clearTimers();
      shownAtRef.current = Date.now();
      setVisible(true);

      forceHideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        forceHideTimerRef.current = null;
      }, MAX_VISIBLE_MS);
    };

    const hide = () => {
      if (!visible) return;

      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAtRef.current));
      clearTimers();
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, remaining);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedEvent(event) || event.button !== 0) return;

      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigableAnchor(anchor)) return;

      startNavigationLoading(anchor.href);
    };

    const handleNavigationStart = () => {
      show();
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener(getNavigationLoadingEventName(), handleNavigationStart as EventListener);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener(getNavigationLoadingEventName(), handleNavigationStart as EventListener);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAtRef.current));
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, remaining);
  }, [pathname, searchParams, visible]);

  if (!visible) return null;

  return (
    <div className="buddy-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="buddy-loading-card buddy-loading-card-overlay">
        <div className="buddy-loading-badge">Loading</div>

        <div className="buddy-loading-stage">
          <div className="buddy-loading-orbit" />
          <div className="buddy-loading-orbit buddy-loading-orbit-delayed" />

          <div className="buddy-loading-track">
            <span className="buddy-loading-lane buddy-loading-lane-one" />
            <span className="buddy-loading-lane buddy-loading-lane-two" />
            <span className="buddy-loading-spark buddy-loading-spark-one" />
            <span className="buddy-loading-spark buddy-loading-spark-two" />
            <span className="buddy-loading-spark buddy-loading-spark-three" />

            <div className="buddy-loading-runner">
              <BuddyCompanion
                stage="growing"
                focus="coursework"
                variant="bear"
                mood="proud"
                float={false}
                className="buddy-loading-pet"
              />
            </div>
          </div>
        </div>

        <p className="buddy-loading-title">Loading</p>
        <p className="buddy-loading-note">Your buddy is hurrying to the next stop.</p>
      </div>
    </div>
  );
}
