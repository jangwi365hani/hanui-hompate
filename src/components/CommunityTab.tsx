"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check, EyeOff, Undo2, MessageSquare, Star, Lock, AlertTriangle, Loader2, Trash2,
} from "lucide-react";
import type { Post, PostKind, PostStatus } from "@/lib/community-types";
import type { AdRiskHit } from "@/lib/medical-ad-check";

interface AdminPost extends Post {
  adRisk: AdRiskHit[];
}

interface Props {
  pw: string;
}

const FILTERS: { key: PostKind | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "review", label: "병원후기" },
  { key: "inquiry", label: "상담문의" },
];

const STATUS_STYLE: Record<PostStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-gray-100 text-gray-600 border-gray-200",
  hidden: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_TEXT: Record<PostStatus, string> = {
  pending: "검토 중",
  published: "게시됨",
  rejected: "게시 보류",
  hidden: "숨김",
};

export default function CommunityTab({ pw }: Props) {
  const [filter, setFilter] = useState<PostKind | "all">("all");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState("");
  const [replyFor, setReplyFor] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch(`/api/community/admin?kind=${filter}`, {
        headers: { "x-admin-password": pw },
        cache: "no-store",
      });
      if (res.status === 503) {
        setNotice("커뮤니티 DB(DATABASE_URL)가 아직 연결되지 않았습니다.");
        setPosts([]);
        return;
      }
      if (res.status === 401) {
        setNotice("커뮤니티 관리는 대표원장 비밀번호로만 열 수 있습니다.");
        setPosts([]);
        return;
      }
      const d = await res.json();
      setPosts(Array.isArray(d.posts) ? d.posts : []);
      setPendingCount(d.pendingCount || 0);
    } catch {
      setNotice("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [filter, pw]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: number, status: PostStatus, memo = "") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/community/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id, status, memo }),
      });
      if (!res.ok) {
        showMsg("변경하지 못했습니다.");
        return;
      }
      showMsg(status === "published" ? "게시했습니다." : "변경했습니다.");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: number) => {
    // 보류 사유는 작성자에게 그대로 보이므로 기본 문구를 넣어 둔다
    const memo = window.prompt(
      "게시 보류 사유를 적어주세요. 작성자에게 그대로 표시됩니다.",
      "의료광고 관련 법령상 게시가 어려운 표현이 있어 보류되었습니다. 수정 후 다시 등록해 주세요."
    );
    if (memo === null) return;
    setStatus(id, "rejected", memo);
  };

  const submitReply = async (postId: number) => {
    if (replyText.trim().length < 2) {
      showMsg("답변 내용을 입력해 주세요.");
      return;
    }
    setBusyId(postId);
    try {
      const res = await fetch("/api/community/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, postId, body: replyText }),
      });
      if (!res.ok) {
        showMsg("답변 등록에 실패했습니다.");
        return;
      }
      setReplyFor(null);
      setReplyText("");
      showMsg("답변을 등록했습니다.");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const deleteReply = async (replyId: number) => {
    if (!window.confirm("이 답변을 삭제할까요?")) return;
    const res = await fetch("/api/community/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, replyId }),
    });
    if (res.ok) {
      showMsg("삭제했습니다.");
      load();
    } else {
      showMsg("삭제하지 못했습니다.");
    }
  };

  return (
    <div>
      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">커뮤니티 관리</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              검토 대기 {pendingCount}건
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f.key
                  ? "bg-[#8B1A2B] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 leading-relaxed">
        환자 후기는 홈페이지에 올라가는 순간 의료광고로 볼 수 있습니다(의료법 제56조). 치료 효과를
        단정하거나 최상급 표현이 있는 글은 아래에 <b>표현 주의</b> 배지로 표시됩니다. 판단은 직접
        하시고, 애매하면 보류를 권합니다.
      </p>

      {notice && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-gray-300">
          <Loader2 className="animate-spin" size={26} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">등록된 글이 없습니다.</div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">
                  {p.kind === "review" ? <Star size={11} /> : <Lock size={11} />}
                  {p.kind === "review" ? "병원후기" : "상담문의"}
                </span>
                <span
                  className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${STATUS_STYLE[p.status]}`}
                >
                  {STATUS_TEXT[p.status]}
                </span>
                {p.adRisk.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                    <AlertTriangle size={11} /> 표현 주의
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {p.nickname} · {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>

              {p.kind === "review" && p.rating != null && (
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={
                        n <= p.rating! ? "text-[#FFB400] fill-[#FFB400]" : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                </div>
              )}

              {p.title && <h3 className="font-bold text-gray-900 text-[15px] mb-1.5">{p.title}</h3>}
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line break-words">
                {p.content}
              </p>

              {p.adRisk.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-red-800 mb-1.5">검토가 필요한 표현</p>
                  <ul className="text-xs text-red-700 space-y-1 leading-relaxed">
                    {[...new Map(p.adRisk.map((r) => [r.term, r])).values()].map((r) => (
                      <li key={r.term}>
                        <b>&ldquo;{r.term}&rdquo;</b> — {r.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 병원 답변 */}
              {p.replies.map((rep) => (
                <div
                  key={rep.id}
                  className="mt-3 bg-[#faf5f6] border-l-2 border-[#8B1A2B] rounded-r-xl px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#8B1A2B] mb-1">{rep.authorName}</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
                      {rep.body}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReply(rep.id)}
                    aria-label="답변 삭제"
                    className="text-gray-300 hover:text-red-500 transition shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* 답변 입력 */}
              {replyFor === p.id ? (
                <div className="mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="답변을 입력하세요. 작성자에게 그대로 보입니다."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#8B1A2B] resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => submitReply(p.id)}
                      disabled={busyId === p.id}
                      className="bg-[#8B1A2B] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#7a1626] transition disabled:opacity-50"
                    >
                      답변 등록
                    </button>
                    <button
                      onClick={() => {
                        setReplyFor(null);
                        setReplyText("");
                      }}
                      className="text-sm text-gray-500 px-3"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.kind === "review" && p.status !== "published" && (
                    <button
                      onClick={() => setStatus(p.id, "published")}
                      disabled={busyId === p.id}
                      className="flex items-center gap-1.5 bg-[#8B1A2B] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#7a1626] transition disabled:opacity-50"
                    >
                      <Check size={14} /> 게시 승인
                    </button>
                  )}
                  {p.kind === "review" && p.status === "pending" && (
                    <button
                      onClick={() => reject(p.id)}
                      disabled={busyId === p.id}
                      className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Undo2 size={14} /> 보류
                    </button>
                  )}
                  {p.status === "published" && (
                    <button
                      onClick={() => setStatus(p.id, "hidden")}
                      disabled={busyId === p.id}
                      className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <EyeOff size={14} /> 숨기기
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyFor(p.id);
                      setReplyText("");
                    }}
                    className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <MessageSquare size={14} /> 답변 달기
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
