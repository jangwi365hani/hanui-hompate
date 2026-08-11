"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, ChevronUp, X, Check, Loader2 } from "lucide-react";

/**
 * 화면 하단 고정 상담신청 폼.
 *
 * 높이는 globals.css 의 --consultbar-h 로 관리한다. body 의 padding-bottom 과
 * 메인 페이지 플로팅 버튼의 bottom 이 이 값을 따라가므로, 높이를 바꾸면 변수만 고치면 된다.
 *
 * 데스크톱은 한 줄로 펼쳐 두고, 모바일은 막대만 두었다가 눌렀을 때 시트로 올라온다.
 * (모바일에서 입력칸 4개를 늘 띄워 두면 화면을 너무 많이 가린다)
 *
 * 이름·연락처를 받는 폼이라 동의 체크 없이는 전송 버튼이 동작하지 않는다.
 */

const SUBJECTS = [
  "성장", "디스크·통증", "다이어트", "여성", "비염", "소화", "피로·항노화",
  "안면마비·중풍", "방문진료", "기타",
];

const HIDDEN_PREFIXES = ["/admin", "/system", "/dashboard", "/login", "/manage", "/tangjeon"];

export default function ConsultBar() {
  const pathname = usePathname() || "/";
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const [open, setOpen] = useState(false); // 모바일 시트
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (hidden) root.style.setProperty("--consultbar-h", "0px");
    else root.style.removeProperty("--consultbar-h");
  }, [hidden]);

  if (hidden) return null;

  const submit = async () => {
    setError("");
    if (!agree) return setError("개인정보 수집·이용에 동의해 주세요.");
    if (name.trim().length < 2) return setError("이름을 입력해 주세요.");
    if (phone.replace(/\D/g, "").length < 9) return setError("연락처를 정확히 입력해 주세요.");

    setBusy(true);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject, name, phone, message, agree,
          source: pathname,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error || "잠시 후 다시 시도해 주세요.");
        return;
      }
      setDone(true);
      setSubject(""); setName(""); setPhone(""); setMessage(""); setAgree(false);
      setOpen(false);
      setTimeout(() => setDone(false), 6000);
    } catch {
      setError("네트워크 오류입니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#8B1A2B] focus:outline-none focus:ring-1 focus:ring-[#8B1A2B]/30";

  const agreeRow = (
    <label className="flex items-start gap-2 text-[11px] leading-snug text-gray-500 cursor-pointer">
      <input
        type="checkbox"
        checked={agree}
        onChange={(e) => setAgree(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#8B1A2B]"
      />
      <span>
        개인정보 수집 및 이용에 동의합니다.{" "}
        <a href="/privacy" className="underline hover:text-gray-700" target="_blank" rel="noreferrer">
          내용보기
        </a>
      </span>
    </label>
  );

  return (
    <>
      {/* 접수 완료 알림 */}
      {done && (
        <div className="fixed inset-x-0 bottom-[calc(var(--consultbar-h)+1rem)] z-50 flex justify-center px-4">
          <p className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm text-white shadow-lg">
            <Check size={16} className="text-green-400" />
            상담신청이 접수되었습니다. 진료시간 내에 연락드리겠습니다.
          </p>
        </div>
      )}

      {/* 모바일 시트 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-5 pb-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">빠른 상담신청</h2>
              <button onClick={() => setOpen(false)} aria-label="닫기" className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
                <option value="">진료 과목 선택</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input className={field} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
              <input
                className={field}
                placeholder="연락처 (숫자만)"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <textarea
                className={`${field} h-24 resize-none`}
                placeholder="문의 내용 (선택)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {agreeRow}
              {error && <p className="text-xs text-[#8B1A2B]">{error}</p>}
              <button
                onClick={submit}
                disabled={busy}
                className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#8B1A2B] py-3.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                상담신청
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        {/* 모바일 — 막대 두 개 */}
        <div className="flex h-[var(--consultbar-h)] items-center gap-2 px-3 md:hidden">
          <a
            href="tel:02-6952-2800"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-[#8B1A2B]"
            aria-label="전화 걸기"
          >
            <Phone size={18} />
          </a>
          <button
            onClick={() => setOpen(true)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#8B1A2B] text-sm font-bold text-white"
          >
            빠른 상담신청 <ChevronUp size={16} />
          </button>
        </div>

        {/* 데스크톱 — 한 줄 */}
        <div className="mx-auto hidden h-[var(--consultbar-h)] max-w-6xl items-center gap-2.5 px-6 md:flex">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`${field} w-36 shrink-0`}
            aria-label="진료 과목"
          >
            <option value="">진료 과목</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            className={`${field} w-32 shrink-0`}
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="이름"
          />
          <input
            className={`${field} w-40 shrink-0`}
            placeholder="연락처"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="연락처"
          />
          <input
            className={field}
            placeholder="문의 내용 (선택)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
            aria-label="문의 내용"
          />
          <div className="w-52 shrink-0">{agreeRow}</div>
          <button
            onClick={submit}
            disabled={busy}
            className="flex h-11 w-32 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#8B1A2B] text-sm font-bold text-white transition hover:bg-[#7A1626] disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            상담신청
          </button>
        </div>

        {error && (
          <p className="hidden pb-2 text-center text-xs text-[#8B1A2B] md:block">{error}</p>
        )}
      </div>
    </>
  );
}
