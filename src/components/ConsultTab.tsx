"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Phone, Trash2, Undo2, Ban } from "lucide-react";

/**
 * 관리자 화면 — 상담신청 목록.
 *
 * 개인정보(이름·연락처)를 다루는 화면이라 두 가지가 다른 탭과 다르다.
 *  - 대표원장 비밀번호로만 열린다(직원 비밀번호 불가).
 *  - '삭제'는 상태 변경이 아니라 **실제 DELETE** 다. 회신이 끝난 건은 지워서 개인정보를 남기지 않는다.
 */

interface Item {
  id: number;
  subject: string;
  name: string;
  phone: string;
  message: string;
  status: "new" | "done" | "spam";
  memo: string;
  source: string;
  createdAt: string;
}

const STATUS_STYLE: Record<Item["status"], string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  done: "bg-green-50 text-green-700 border-green-200",
  spam: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_TEXT: Record<Item["status"], string> = {
  new: "미처리",
  done: "처리완료",
  spam: "스팸",
};

function fmtPhone(d: string) {
  const n = (d || "").replace(/\D/g, "");
  if (n.length === 11) return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  return n;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ConsultTab({ pw }: { pw: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch("/api/consult", {
        headers: { "x-admin-password": pw },
        cache: "no-store",
      });
      if (res.status === 401) {
        setNotice("상담신청은 대표원장 비밀번호로만 열 수 있습니다.");
        setItems([]);
        return;
      }
      const d = await res.json();
      setItems(Array.isArray(d.items) ? d.items : []);
      setNewCount(d.newCount || 0);
    } catch {
      setNotice("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [pw]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: number, status: Item["status"], memo: string) => {
    setBusyId(id);
    try {
      await fetch("/api/consult", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id, status, memo }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const destroy = async (id: number, name: string) => {
    if (!confirm(`${name}님의 상담신청을 완전히 삭제할까요?\n(개인정보 파기 — 되돌릴 수 없습니다)`)) return;
    setBusyId(id);
    try {
      await fetch("/api/consult", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          하단 고정 폼으로 들어온 상담신청입니다.
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              미처리 {newCount}건
            </span>
          )}
        </p>
        <button onClick={load} className="text-sm text-gray-500 hover:text-gray-800">
          새로고침
        </button>
      </div>

      <p className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
        회신이 끝난 건은 <b>삭제</b>를 눌러 지워 주세요. 이름·연락처가 담긴 자료라 처리완료로만
        두면 개인정보가 계속 남습니다. 삭제는 되돌릴 수 없습니다.
      </p>

      {notice && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-gray-300">
          <Loader2 className="animate-spin" size={26} />
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">아직 접수된 상담신청이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">
                    {it.name}
                    <a
                      href={`tel:${it.phone}`}
                      className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-[#8B1A2B] hover:underline"
                    >
                      <Phone size={13} /> {fmtPhone(it.phone)}
                    </a>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {it.subject || "과목 미선택"} · {fmtDate(it.createdAt)}
                    {it.source ? ` · ${it.source}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[it.status]}`}
                >
                  {STATUS_TEXT[it.status]}
                </span>
              </div>

              {it.message && (
                <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-gray-700">
                  {it.message}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {it.status !== "done" && (
                  <button
                    onClick={() => patch(it.id, "done", it.memo)}
                    disabled={busyId === it.id}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    <Check size={14} /> 처리완료
                  </button>
                )}
                {it.status === "done" && (
                  <button
                    onClick={() => patch(it.id, "new", it.memo)}
                    disabled={busyId === it.id}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <Undo2 size={14} /> 미처리로
                  </button>
                )}
                {it.status !== "spam" && (
                  <button
                    onClick={() => patch(it.id, "spam", it.memo)}
                    disabled={busyId === it.id}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <Ban size={14} /> 스팸
                  </button>
                )}
                <button
                  onClick={() => destroy(it.id, it.name)}
                  disabled={busyId === it.id}
                  className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 size={14} /> 삭제(파기)
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
