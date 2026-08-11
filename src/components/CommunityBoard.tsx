"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Star, Lock, MessageSquare, PenLine, LogOut, ShieldCheck, Loader2, X, Trash2, AlertCircle, ChevronDown,
} from "lucide-react";
import type { Post, PostKind } from "@/lib/community-types";
import { AD_NOTICE, checkAdRisk } from "@/lib/medical-ad-check";

interface Ready {
  db: boolean;
  secret: boolean;
  kakao: boolean;
  naver: boolean;
}

// 탭 순서 = 화면 순서. 상담문의를 앞에 둔다 —
// 비로그인 방문자도 제목을 볼 수 있는 쪽이라 첫 화면이 비어 보이지 않는다.
const TABS: { kind: PostKind; label: string; desc: string }[] = [
  {
    kind: "inquiry",
    label: "상담문의",
    desc: "증상·치료·예약 관련 문의를 남겨주세요. 제목은 다른 분들께도 보이고, 내용과 답변은 작성자 본인과 병원만 볼 수 있습니다.",
  },
  {
    kind: "review",
    label: "병원후기",
    desc: "진료를 받으신 경험을 남겨주세요. 확인 후 게시되며, 로그인한 회원에게만 보입니다.",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function Stars({ n, size = 15 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= n ? "text-[#FFB400] fill-[#FFB400]" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </span>
  );
}

export default function CommunityBoard() {
  const [tab, setTab] = useState<PostKind>("inquiry");
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // 비로그인 상태에서 후기가 몇 개 쌓여 있는지 (내용은 서버가 안 내려준다)
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");
  const [ready, setReady] = useState<Ready>({ db: true, secret: true, kakao: true, naver: true });
  const [writing, setWriting] = useState(false);
  const [msg, setMsg] = useState("");

  // 작성 폼
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showMsg = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3500);
  };

  // 로그인 실패 등으로 ?error= 를 달고 돌아온 경우 한 번만 띄우고 주소를 정리한다
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const err = q.get("error");
    if (err) {
      showMsg(err);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const r = await fetch("/api/community/session", { cache: "no-store" });
      const d = await r.json();
      setLoggedIn(Boolean(d.loggedIn));
      setNickname(d.nickname || "");
      if (d.ready) setReady(d.ready);
    } catch {
      /* 세션 조회 실패는 비로그인으로 취급한다 */
    }
  }, []);

  /**
   * 목록 조회. 한 번에 20건씩 내려오므로 page 를 올려가며 이어 붙인다.
   * append=false 면 처음부터 다시 그린다(탭 전환·글 등록 후).
   */
  const loadPosts = useCallback(async (kind: PostKind, nextPage = 0, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const r = await fetch(`/api/community/posts?kind=${kind}&page=${nextPage}`, { cache: "no-store" });
      const d = await r.json();
      const list: Post[] = Array.isArray(d.posts) ? d.posts : [];
      setPosts((prev) => (append ? [...prev, ...list] : list));
      setHasMore(Boolean(d.hasMore));
      setReviewCount(typeof d.count === "number" ? d.count : null);
      setPage(nextPage);
    } catch {
      if (!append) setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // 탭을 바꾸거나 로그인 상태가 달라지면 첫 페이지부터 다시 그린다.
  useEffect(() => {
    loadPosts(tab, 0, false);
  }, [tab, loggedIn, loadPosts]);

  const logout = async () => {
    await fetch("/api/community/session", { method: "DELETE" });
    setLoggedIn(false);
    setNickname("");
    showMsg("로그아웃되었습니다.");
  };

  const openWrite = () => {
    if (!loggedIn) {
      showMsg("글을 남기시려면 먼저 로그인해 주세요.");
      return;
    }
    setTitle("");
    setContent("");
    setRating(5);
    setAgreed(false);
    setWriting(true);
  };

  const submit = async () => {
    if (content.trim().length < 5) {
      showMsg("내용을 5자 이상 입력해 주세요.");
      return;
    }
    if (!agreed) {
      showMsg("작성 안내에 동의해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: tab, title, content, rating }),
      });
      const d = await r.json();
      if (!r.ok) {
        showMsg(d.error || "등록에 실패했습니다.");
        return;
      }
      setWriting(false);
      showMsg(
        tab === "review"
          ? "등록되었습니다. 확인 후 게시됩니다."
          : "문의가 접수되었습니다. 확인 후 답변드리겠습니다."
      );
      loadPosts(tab, 0, false);
    } catch {
      showMsg("등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    const r = await fetch(`/api/community/posts/${id}`, { method: "DELETE" });
    if (r.ok) {
      showMsg("삭제되었습니다.");
      loadPosts(tab, 0, false);
    } else {
      showMsg("삭제하지 못했습니다.");
    }
  };

  const activeTab = TABS.find((t) => t.kind === tab)!;
  const risks = tab === "review" ? checkAdRisk(content) : [];
  const notReady = !ready.db || !ready.secret;
  const noProvider = !ready.kakao && !ready.naver;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 max-w-[90vw] text-center">
          {msg}
        </div>
      )}

      {/* 로그인 영역 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        {loggedIn ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-[#8B1A2B]">{nickname || "회원"}</span>님으로 로그인
              중입니다.
            </p>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              <LogOut size={15} /> 로그아웃
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 font-medium mb-1">
              카카오·네이버 계정으로 간편하게 이용하세요
            </p>
            <p className="text-xs text-gray-400 mb-4">
              별명(닉네임)만 받습니다. 이메일·전화번호·생년월일은 수집하지 않습니다.
            </p>

            {notReady ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                커뮤니티 로그인 준비 중입니다. 잠시 후 다시 이용해 주세요.
              </p>
            ) : noProvider ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                소셜 로그인 연동 준비 중입니다.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2.5">
                {ready.kakao && (
                  // 라우트 핸들러가 카카오 인가 화면으로 302 시키는 자리다.
                  // next/link로 감싸면 클라이언트 라우팅이 끼어들어 리다이렉트가 깨지므로 <a>를 쓴다.
                  // eslint-disable-next-line @next/next/no-html-link-for-pages
                  <a
                    href="/api/community/auth/kakao?redirect=/community"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FEE500] text-[#3A1D1D] font-bold text-sm px-5 py-3 rounded-xl hover:brightness-95 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#3A1D1D" aria-hidden>
                      <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.7 1.7 5.05 4.25 6.4L6.1 21l4.6-2.9c.42.05.86.08 1.3.08 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" />
                    </svg>
                    카카오로 시작하기
                  </a>
                )}
                {ready.naver && (
                  // 카카오와 같은 이유로 <a> 유지 (라우트 핸들러 → 네이버 인가 화면 302)
                  // eslint-disable-next-line @next/next/no-html-link-for-pages
                  <a
                    href="/api/community/auth/naver?redirect=/community"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#03C75A] text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#02b350] transition"
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-[11px] font-black leading-none">
                      N
                    </span>
                    네이버로 시작하기
                  </a>
                )}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
              로그인 시{" "}
              <a href="/privacy" className="underline hover:text-gray-600">
                개인정보처리방침
              </a>
              에 따라 별명이 수집되는 것에 동의하는 것으로 봅니다.
            </p>
          </div>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.kind}
            onClick={() => setTab(t.kind)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
              tab === t.kind
                ? "bg-[#8B1A2B] text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:text-gray-800"
            }`}
          >
            {t.kind === "review" ? <Star size={15} /> : <Lock size={15} />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-start justify-between gap-4 mb-5">
        <p className="text-sm text-gray-500 leading-relaxed">{activeTab.desc}</p>
        <button
          onClick={openWrite}
          className="shrink-0 flex items-center gap-1.5 bg-[#8B1A2B] text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-[#7a1626] transition"
        >
          <PenLine size={15} /> 글쓰기
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-300">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : tab === "review" && !loggedIn ? (
        /* 후기 잠금 화면 — 내용은 서버가 아예 안 내려주므로, 뒤에 쌓인 느낌만
           흐릿한 자리표시 카드로 보여주고 그 위에 로그인 안내를 얹는다. */
        <div className="relative">
          <div aria-hidden className="select-none blur-[5px] opacity-70 space-y-4 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="mb-2">
                  <Stars n={i === 3 ? 4 : 5} />
                </div>
                <div className="h-3.5 w-2/5 rounded bg-gray-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-11/12 rounded bg-gray-100" />
                  <div className="h-3 w-3/5 rounded bg-gray-100" />
                </div>
                <div className="mt-4 h-2.5 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>

          {/* 아래로 갈수록 하얗게 — 더 쌓여 있는 것처럼 보이게 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-gray-50" />

          <div className="absolute inset-0 flex items-start justify-center pt-24">
            <div className="mx-4 max-w-sm rounded-2xl border border-gray-200 bg-white/95 px-6 py-6 text-center shadow-lg backdrop-blur-sm">
              <Lock size={22} className="mx-auto text-[#8B1A2B]" />
              <p className="mt-3 text-[15px] font-bold text-gray-900">
                {reviewCount != null && reviewCount > 0
                  ? `${reviewCount.toLocaleString()}개의 후기가 있습니다`
                  : "등록된 후기가 있습니다"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                후기는 로그인한 회원에게만 보입니다.
                <br />
                카카오·네이버로 로그인하고 확인해 보세요.
              </p>
              <a
                href="#community-login"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-4 inline-block rounded-full bg-[#8B1A2B] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#7A1626]"
              >
                로그인하고 후기 보기
              </a>
            </div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {!loggedIn ? (
            <span className="inline-flex flex-col items-center gap-2">
              <Lock size={22} className="text-gray-300" />
              로그인하시면 내가 남긴 문의와 답변을 확인할 수 있습니다.
            </span>
          ) : (
            "아직 등록된 글이 없습니다. 첫 글을 남겨보세요."
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  {p.kind === "review" && p.rating != null && (
                    <div className="mb-1.5">
                      <Stars n={p.rating} />
                    </div>
                  )}
                  {p.title && (
                    <h3 className="font-bold text-gray-900 text-[15px] mb-1 break-words">
                      {p.title}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.status === "pending" && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                      검토 중
                    </span>
                  )}
                  {p.status === "rejected" && (
                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1">
                      게시 보류
                    </span>
                  )}
                  {p.kind === "inquiry" && p.locked && (p.replyCount ?? 0) > 0 && (
                    <span className="text-[11px] font-semibold text-[#8B1A2B] bg-[#faf5f6] border border-[#e9d6da] rounded-full px-2.5 py-1">
                      답변완료
                    </span>
                  )}
                  {p.kind === "inquiry" && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                      <Lock size={11} /> 비공개
                    </span>
                  )}
                  {p.isMine && (
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="삭제"
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {p.locked ? (
                <p className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Lock size={13} /> 내용은 작성자 본인과 병원만 볼 수 있습니다.
                </p>
              ) : (
                <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-line break-words">
                  {p.content}
                </p>
              )}

              {p.status === "rejected" && p.rejectMemo && (
                <p className="mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-relaxed">
                  {p.rejectMemo}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-3">
                {p.nickname} · {formatDate(p.createdAt)}
              </p>

              {/* 병원 답변 */}
              {p.replies.map((rep) => (
                <div
                  key={rep.id}
                  className="mt-4 bg-[#faf5f6] border-l-2 border-[#8B1A2B] rounded-r-xl px-4 py-3"
                >
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#8B1A2B] mb-1.5">
                    <ShieldCheck size={13} /> {rep.authorName}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line break-words">
                    {rep.body}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">{formatDate(rep.createdAt)}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      {/* 더 보기 — 한 번에 20건씩 이어 붙인다 */}
      {!loading && hasMore && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={() => loadPosts(tab, page + 1, true)}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-[#8B1A2B] hover:text-[#8B1A2B] disabled:opacity-60"
          >
            {loadingMore ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
            {loadingMore ? "불러오는 중" : "더 보기"}
          </button>
          <p className="text-xs text-gray-400">{posts.length}개 표시 중</p>
        </div>
      )}
      {!loading && !hasMore && posts.length > 20 && (
        <p className="mt-6 text-center text-xs text-gray-400">
          전체 {posts.length}개를 모두 불러왔습니다.
        </p>
      )}

      {/* 작성 모달 */}
      {writing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setWriting(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">
                {tab === "review" ? "병원후기 작성" : "상담문의 작성"}
              </h2>
              <button onClick={() => setWriting(false)} aria-label="닫기" className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {tab === "review" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} aria-label={`${n}점`}>
                        <Star
                          size={28}
                          className={
                            n <= rating
                              ? "text-[#FFB400] fill-[#FFB400]"
                              : "text-gray-200 fill-gray-200"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder={tab === "review" ? "예) 허리 치료 받았습니다" : "예) 추나 치료 문의"}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B1A2B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={7}
                  maxLength={5000}
                  placeholder={
                    tab === "review"
                      ? "치료받으신 경험을 자유롭게 남겨주세요."
                      : "궁금하신 내용을 남겨주세요. 정확한 진단은 내원 후 진료를 통해 가능합니다."
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[#8B1A2B] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{content.length} / 5000</p>
              </div>

              {/* 의료법상 문제될 수 있는 표현을 미리 알려준다 — 막지는 않는다 */}
              {risks.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
                    <AlertCircle size={13} /> 이런 표현은 게시가 어려울 수 있어요
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {[...new Set(risks.map((r) => r.term))].join(", ")}
                  </p>
                </div>
              )}

              <div
                className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  tab === "review"
                    ? "bg-gray-50 border border-gray-200 text-gray-600"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}
              >
                {tab === "review" ? (
                  AD_NOTICE
                ) : (
                  <>
                    <b>제목은 게시판에 공개되고</b>, 내용과 답변은 작성자 본인과 병원만 볼 수 있습니다.
                    제목에는 이름·연락처처럼 본인을 알 수 있는 정보를 넣지 말아 주세요. 인터넷 상담은
                    진단·처방을 대신할 수 없으며, 주민등록번호 등 민감한 정보는 남기지 말아 주세요.
                  </>
                )}
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#8B1A2B]"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  위 안내를 확인했으며, 작성한 글이{" "}
                  {tab === "review" ? "확인 후 홈페이지에 게시" : "병원에 전달"}되는 것에
                  동의합니다.
                </span>
              </label>

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-[#8B1A2B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#7a1626] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                {tab === "review" ? "후기 등록" : "문의 접수"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
