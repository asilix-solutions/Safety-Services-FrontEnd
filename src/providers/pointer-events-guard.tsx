"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Safety guard to ensure Radix UI / browser modal locks never leave
 * `pointer-events: none` stuck on `document.body` after closing drawers/dialogs.
 */
export function PointerEventsGuard() {
  const pathname = usePathname();

  // Reset pointer events on route changes
  useEffect(() => {
    document.body.style.pointerEvents = "";
  }, [pathname]);

  // MutationObserver to catch any orphaned pointer-events: none
  useEffect(() => {
    const cleanup = () => {
      const hasOpenOverlay = document.querySelector(
        '[data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"], [data-radix-popper-content-wrapper]'
      );
      if (!hasOpenOverlay && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    };

    const observer = new MutationObserver(() => {
      // Debounce slightly to allow natural Radix transitions
      setTimeout(cleanup, 100);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "aria-hidden", "data-scroll-locked"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

export default PointerEventsGuard;
