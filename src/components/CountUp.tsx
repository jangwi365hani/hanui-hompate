"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 숫자 카운트업 — "10,000+" / "365일" / "100%" 처럼 숫자 뒤에 단위가 붙은 값을 그대로 받는다.
 *
 * 화면에 들어왔을 때 한 번만 올라간다. 숫자를 못 읽는 값이면 원본을 그대로 보여준다.
 * 애니메이션을 원치 않는 사용자에게는 최종값을 바로 보여준다(움직임 없음).
 */
export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<string>(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // "10,000+" → 숫자 10000, 접미사 "+"
    const match = value.match(/^([\d,]+)(.*)$/);
    const target = match ? Number(match[1].replace(/,/g, "")) : NaN;
    const suffix = match ? match[2] : "";
    if (!Number.isFinite(target) || target === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const format = (n: number) => n.toLocaleString("ko-KR") + suffix;

    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        // 0 으로 되돌리는 것도 관찰 콜백 안에서 한다.
        // effect 본문에서 곧바로 setState 하면 화면에 값이 한 번 그려진 뒤 다시 그려진다
        // (react-hooks/set-state-in-effect). 화면에 들어온 순간부터 세면 충분하다.
        setShown(format(0));

        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min(1, (ts - start) / duration);
          // 끝에서 부드럽게 멈추도록 (ease-out)
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(format(Math.round(target * eased)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  );
}
