"use client";
import { useEffect } from "react";

/**
 * 스크롤 등장 효과 — data-reveal 이 붙은 요소가 화면에 들어오면 .is-in 을 붙인다.
 *
 * 요소마다 컴포넌트로 감싸지 않고 속성 하나로 처리한다(마크업을 건드리지 않기 위함).
 * 한 번 나타난 요소는 다시 감시하지 않아 스크롤이 무거워지지 않는다.
 * 애니메이션을 원치 않는 사용자(prefers-reduced-motion)는 CSS 에서 이미 제외된다.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    // 지원하지 않는 브라우저에서는 그냥 다 보이게 두고 끝낸다
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      // 아래에서 12% 쯤 올라왔을 때 시작해야 '읽으려는 순간' 자연스럽게 들어온다
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => io.observe(el));

    /**
     * 안전장치 — 관찰이 어떤 이유로든 동작하지 않아도 내용이 사라지지 않게 한다.
     * 브라우저는 보이지 않는 탭에서 IntersectionObserver 콜백을 미루는데,
     * 그 상태로 두면 [data-reveal] 이 opacity:0 으로 남아 '내용이 없는 페이지'가 된다.
     *  · 탭이 다시 보이면 즉시 재확인
     *  · 그래도 안 되면 2.5초 뒤 화면 안에 있는 요소는 모두 노출
     */
    const revealVisible = () => {
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") revealVisible();
    };
    document.addEventListener("visibilitychange", onVisible);
    const fallback = window.setTimeout(revealVisible, 2500);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
