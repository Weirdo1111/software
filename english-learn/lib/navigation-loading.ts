const NAVIGATION_LOADING_EVENT = "english-learn:navigation-loading";

export function getNavigationLoadingEventName() {
  return NAVIGATION_LOADING_EVENT;
}

export function startNavigationLoading(href?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(NAVIGATION_LOADING_EVENT, {
      detail: { href: href ?? null },
    }),
  );
}
