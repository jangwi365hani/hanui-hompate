"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Eye, EyeOff, Save, LogOut, Bell, BellOff, Upload, Sparkles, StopCircle } from "lucide-react";
import { upload } from "@vercel/blob/client";
import HandoverTab from "@/components/HandoverTab";
import WikiTab from "@/components/WikiTab";
import RichEditor from "@/components/RichEditor";

interface Event {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface Popup {
  isActive: boolean;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

interface Doctor {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  tags: string[];
  bio: string[];
  imageUrl: string;
  isActive: boolean;
}

const STORAGE_KEY = "admin-pw";

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginRole, setLoginRole] = useState<"doc" | "staff">("staff");
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [tab, setTab] = useState<"events" | "columns" | "doctors" | "popup" | "handover" | "wiki" | "holidays">("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [editingColumn, setEditingColumn] = useState<Partial<Column> | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  // 태그/인사말은 폼에서 문자열로 편집하므로 별도 타입으로 보관
  const [editingDoctor, setEditingDoctor] = useState<
    (Partial<Omit<Doctor, "tags" | "bio">> & { tags?: string; bio?: string }) | null
  >(null);
  const [popup, setPopup] = useState<Popup>({
    isActive: false,
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "자세히 보기",
  });

  const [holidays, setHolidays] = useState<Record<string, number>>({});
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayHour, setNewHolidayHour] = useState(17);

  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiMode, setAiMode] = useState<"draft" | "expand" | "polish">("draft");
  const [aiLoading, setAiLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: saved }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setPw(saved);
          setLoginRole(data.role ?? "staff");
          setTab("events");
          setAuthed(true);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchEvents();
      fetchPopup();
      fetchHolidays();
      fetchDoctors();
      if (loginRole === "doc") fetchColumns();
    }
  }, [authed, loginRole]);

  const login = async () => {
    if (!pwInput) return;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setPw(pwInput);
        setLoginRole(data.role ?? "staff");
        setTab("events");
        sessionStorage.setItem(STORAGE_KEY, pwInput);
        setAuthed(true);
        setPwError("");
      } else {
        setPwError("비밀번호가 틀렸습니다.");
      }
    } catch {
      setPwError("서버 연결에 실패했습니다.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPw("");
    setPwInput("");
    setLoginRole("staff");
  };

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  const runAI = async () => {
    if (!editingColumn) return;
    if (aiMode === "draft" && !aiTopic) { showMsg("주제를 입력해주세요."); return; }
    if (aiMode !== "draft" && !editingColumn.content) { showMsg("먼저 내용을 입력해주세요."); return; }

    setAiLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pw,
          mode: aiMode,
          topic: aiTopic,
          title: editingColumn.title,
          currentContent: editingColumn.content,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        showMsg(err.error || "AI 오류");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let result = "";

      // 초안은 새로 작성, 나머지는 기존 내용 교체
      setEditingColumn((prev) => ({ ...prev, content: "" }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setEditingColumn((prev) => ({ ...prev, content: result }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") showMsg("AI 생성 실패");
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  };

  const fetchColumns = async () => {
    const res = await fetch("/api/columns");
    const data = await res.json();
    setColumns(data);
  };

  const fetchPopup = async () => {
    const res = await fetch("/api/popup");
    const data = await res.json();
    setPopup(data);
  };

  const fetchDoctors = async () => {
    const res = await fetch("/api/team");
    const data = await res.json();
    setDoctors(Array.isArray(data) ? data : []);
  };

  // 저장용: 폼의 문자열 tags/bio를 그대로 보내면 서버가 배열로 정규화함
  const saveDoctor = async () => {
    if (!editingDoctor?.name) {
      showMsg("이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const method = editingDoctor.id ? "PUT" : "POST";
      const res = await fetch("/api/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, ...editingDoctor }),
      });
      if (res.status === 401) {
        showMsg("비밀번호가 틀렸습니다. 다시 로그인해주세요.");
        logout();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showMsg(err.error || "저장 실패");
        return;
      }
      await fetchDoctors();
      setEditingDoctor(null);
      showMsg(editingDoctor.id ? "의료진 정보가 수정되었습니다." : "의료진이 등록되었습니다.");
    } catch {
      showMsg("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (id: string) => {
    if (!confirm("이 의료진을 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await fetch("/api/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id }),
      });
      await fetchDoctors();
      showMsg("삭제되었습니다.");
    } catch {
      showMsg("삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleDoctor = async (doc: Doctor) => {
    setLoading(true);
    try {
      await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id: doc.id, isActive: !doc.isActive }),
      });
      await fetchDoctors();
    } catch {
      showMsg("변경 실패");
    } finally {
      setLoading(false);
    }
  };

  // 수정 진입: 배열 필드를 폼 편집용 문자열로 변환
  const startEditDoctor = (doc: Doctor) => {
    setEditingDoctor({
      ...doc,
      tags: (doc.tags || []).join(", "),
      bio: (doc.bio || []).join("\n\n"),
    });
  };

  const fetchHolidays = async () => {
    const res = await fetch("/api/holidays");
    const data = await res.json();
    setHolidays(data || {});
  };

  const saveHolidays = async (next: Record<string, number>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/holidays", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, holidays: next }),
      });
      if (res.status === 401) {
        showMsg("비밀번호가 틀렸습니다.");
        logout();
        return;
      }
      const saved = await res.json();
      setHolidays(saved);
      showMsg("공휴일이 저장되었습니다.");
    } catch {
      showMsg("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const addHoliday = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newHolidayDate)) {
      showMsg("날짜 형식이 올바르지 않습니다 (예: 2026-05-25)");
      return;
    }
    if (holidays[newHolidayDate] !== undefined) {
      showMsg("이미 등록된 날짜입니다");
      return;
    }
    const next = { ...holidays, [newHolidayDate]: newHolidayHour };
    saveHolidays(next);
    setNewHolidayDate("");
    setNewHolidayHour(17);
  };

  const deleteHoliday = (date: string) => {
    if (!confirm(`${date} 공휴일을 삭제하시겠습니까?`)) return;
    const next = { ...holidays };
    delete next[date];
    saveHolidays(next);
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const uploadImage = async (file: File, adminPw: string): Promise<string> => {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify({ password: adminPw }),
    });
    return blob.url;
  };

  const handleImagePick = async (
    file: File,
    setter: (url: string) => void
  ) => {
    setLoading(true);
    try {
      const url = await uploadImage(file, pw);
      setter(url);
      showMsg("이미지 업로드 완료!");
    } catch (e) {
      showMsg(`업로드 실패: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async () => {
    if (!editingEvent?.title) {
      showMsg("제목을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const method = editingEvent.id ? "PUT" : "POST";
      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, ...editingEvent }),
      });
      if (res.status === 401) {
        showMsg("비밀번호가 틀렸습니다. 다시 로그인해주세요.");
        logout();
        return;
      }
      await fetchEvents();
      setEditingEvent(null);
      showMsg(editingEvent.id ? "이벤트가 수정되었습니다." : "이벤트가 등록되었습니다.");
    } catch {
      showMsg("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("이벤트를 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id }),
      });
      await fetchEvents();
      showMsg("삭제되었습니다.");
    } catch {
      showMsg("삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = async (event: Event) => {
    setLoading(true);
    try {
      await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id: event.id, isActive: !event.isActive }),
      });
      await fetchEvents();
    } catch {
      showMsg("변경 실패");
    } finally {
      setLoading(false);
    }
  };

  const savePopup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, ...popup }),
      });
      if (res.status === 401) {
        showMsg("비밀번호가 틀렸습니다.");
        logout();
        return;
      }
      showMsg("팝업 설정이 저장되었습니다.");
    } catch {
      showMsg("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mb-6">장위365경희한의원 관리자 페이지</p>
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-[#8B1A2B]"
          />
          {pwError && <p className="text-red-500 text-xs mb-3">{pwError}</p>}
          <button
            onClick={login}
            className="w-full bg-[#8B1A2B] text-white py-3 rounded-lg font-medium hover:bg-[#7a1626] transition"
          >
            로그인
          </button>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Vercel 환경변수 미설정 시 기본 비밀번호: <span className="font-mono">admin1234</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#8B1A2B] text-white px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs opacity-75">장위365경희한의원</p>
          <h1 className="text-xl font-bold">관리자 페이지</h1>
        </div>
        <button onClick={logout} className="flex items-center gap-1 text-sm opacity-75 hover:opacity-100">
          <LogOut size={16} /> 로그아웃
        </button>
      </div>

      {/* 알림 메시지 */}
      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
          {msg}
        </div>
      )}

      {/* 탭 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setTab("events")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "events"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            이벤트 관리
          </button>
          <button
            onClick={() => setTab("doctors")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "doctors"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            의료진 관리
          </button>
          {loginRole === "doc" && (
            <button
              onClick={() => setTab("columns")}
              className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
                tab === "columns"
                  ? "border-[#8B1A2B] text-[#8B1A2B]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              칼럼 관리
            </button>
          )}
          <button
            onClick={() => setTab("popup")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "popup"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            팝업 관리
          </button>
          <button
            onClick={() => setTab("handover")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "handover"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            인계장
          </button>
          <button
            onClick={() => setTab("wiki")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "wiki"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            위키
          </button>
          <button
            onClick={() => setTab("holidays")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "holidays"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            공휴일
          </button>
          <a
            href="/"
            className="ml-auto py-3 px-5 text-sm text-gray-400 hover:text-gray-600"
          >
            홈페이지 보기 →
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ── 이벤트 탭 ── */}
        {tab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">이벤트 목록</h2>
              <button
                onClick={() =>
                  setEditingEvent({
                    title: "",
                    content: "",
                    imageUrl: "",
                    linkUrl: "",
                    isActive: true,
                  })
                }
                className="flex items-center gap-2 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] transition"
              >
                <Plus size={16} /> 새 이벤트
              </button>
            </div>

            {/* 이벤트 편집 폼 */}
            {editingEvent && (
              <div className="bg-white rounded-2xl border border-[#8B1A2B]/20 p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">
                  {editingEvent.id ? "이벤트 수정" : "새 이벤트 등록"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">제목 *</label>
                    <input
                      type="text"
                      value={editingEvent.title || ""}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      placeholder="이벤트 제목"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">내용</label>
                    <textarea
                      value={editingEvent.content || ""}
                      onChange={(e) => setEditingEvent({ ...editingEvent, content: e.target.value })}
                      placeholder="이벤트 내용 (줄바꿈 가능)"
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">이미지</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingEvent.imageUrl || ""}
                        onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                        placeholder="이미지 URL 또는 아래 업로드"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                      />
                      <label className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition whitespace-nowrap cursor-pointer">
                        <Upload size={14} /> 업로드
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              handleImagePick(file, (url) =>
                                setEditingEvent((prev) => ({ ...prev, imageUrl: url }))
                              );
                          }}
                        />
                      </label>
                    </div>
                    {editingEvent.imageUrl && (
                      <img
                        src={editingEvent.imageUrl}
                        alt="미리보기"
                        className="mt-2 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">링크 URL</label>
                    <input
                      type="text"
                      value={editingEvent.linkUrl || ""}
                      onChange={(e) => setEditingEvent({ ...editingEvent, linkUrl: e.target.value })}
                      placeholder="https://... (선택사항)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingEvent.isActive ?? true}
                      onChange={(e) => setEditingEvent({ ...editingEvent, isActive: e.target.checked })}
                      className="accent-[#8B1A2B]"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      즉시 게시 (이벤트 페이지에 바로 표시)
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={saveEvent}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#8B1A2B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
                  >
                    <Save size={15} /> {editingEvent.id ? "수정 저장" : "등록"}
                  </button>
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="px-5 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 이벤트 목록 */}
            {events.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <p>등록된 이벤트가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl border p-4 flex gap-4 items-start transition ${
                      event.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
                    }`}
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {event.isActive ? "게시중" : "숨김"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                      {event.content && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{event.content}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleEvent(event)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        title={event.isActive ? "숨기기" : "게시하기"}
                      >
                        {event.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 칼럼 탭 ── */}
        {tab === "columns" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">칼럼 목록</h2>
              <button
                onClick={() => setEditingColumn({ title: "", content: "", imageUrl: "", author: "", category: "", isActive: true })}
                className="flex items-center gap-2 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] transition"
              >
                <Plus size={16} /> 새 칼럼
              </button>
            </div>

            {editingColumn && (
              <div className="bg-white rounded-2xl border border-[#8B1A2B]/20 p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">{editingColumn.id ? "칼럼 수정" : "새 칼럼 작성"}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">제목 *</label>
                    <input type="text" value={editingColumn.title || ""} onChange={(e) => setEditingColumn({ ...editingColumn, title: e.target.value })} placeholder="칼럼 제목" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">작성자</label>
                      <input type="text" value={editingColumn.author || ""} onChange={(e) => setEditingColumn({ ...editingColumn, author: e.target.value })} placeholder="예: 김현규 대표원장" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
                      <input type="text" value={editingColumn.category || ""} onChange={(e) => setEditingColumn({ ...editingColumn, category: e.target.value })} placeholder="예: 척추·관절, 다이어트" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]" />
                    </div>
                  </div>
                  {/* AI 글쓰기 도우미 */}
                  <div className="bg-gradient-to-br from-[#fdf3f4] to-purple-50 rounded-xl p-4 border border-[#f5e0e3]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={15} className="text-[#8B1A2B]" />
                      <span className="text-sm font-bold text-[#8B1A2B]">AI 글쓰기 도우미</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {(["draft", "expand", "polish"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setAiMode(m)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${aiMode === m ? "bg-[#8B1A2B] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#8B1A2B]"}`}
                        >
                          {m === "draft" ? "✍️ 초안 작성" : m === "expand" ? "📝 내용 보완" : "✨ 문체 다듬기"}
                        </button>
                      ))}
                    </div>
                    {aiMode === "draft" && (
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && runAI()}
                        placeholder="주제 입력 (예: 봄철 환절기 면역력 관리)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#8B1A2B] bg-white"
                      />
                    )}
                    {aiMode !== "draft" && (
                      <p className="text-xs text-gray-500 mb-3">아래 내용을 바탕으로 AI가 {aiMode === "expand" ? "내용을 보완" : "문체를 다듬어"}합니다.</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={runAI}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
                      >
                        <Sparkles size={14} />
                        {aiLoading ? "생성 중..." : "AI 작성"}
                      </button>
                      {aiLoading && (
                        <button
                          type="button"
                          onClick={() => { abortRef.current?.abort(); setAiLoading(false); }}
                          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition"
                        >
                          <StopCircle size={14} /> 중단
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">내용 *</label>
                    <RichEditor
                      value={editingColumn.content || ""}
                      onChange={(html) => setEditingColumn({ ...editingColumn, content: html })}
                      placeholder="칼럼 내용을 입력하거나 위 AI 도우미를 활용해보세요"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">대표 이미지</label>
                    <div className="flex gap-2">
                      <input type="text" value={editingColumn.imageUrl || ""} onChange={(e) => setEditingColumn({ ...editingColumn, imageUrl: e.target.value })} placeholder="이미지 URL 또는 아래 업로드" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]" />
                      <label className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition whitespace-nowrap cursor-pointer">
                        <Upload size={14} /> 업로드
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImagePick(file, (url) => setEditingColumn((prev) => ({ ...prev, imageUrl: url }))); }} />
                      </label>
                    </div>
                    {editingColumn.imageUrl && <img src={editingColumn.imageUrl} alt="미리보기" className="mt-2 h-32 object-cover rounded-lg border border-gray-200" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="colActive" checked={editingColumn.isActive ?? true} onChange={(e) => setEditingColumn({ ...editingColumn, isActive: e.target.checked })} className="accent-[#8B1A2B]" />
                    <label htmlFor="colActive" className="text-sm text-gray-700">즉시 게시</label>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={async () => {
                      if (!editingColumn?.title || !editingColumn?.content) { showMsg("제목과 내용을 입력해주세요."); return; }
                      setLoading(true);
                      try {
                        const method = editingColumn.id ? "PUT" : "POST";
                        const res = await fetch("/api/columns", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw, ...editingColumn }) });
                        if (res.status === 401) { showMsg("비밀번호가 틀렸습니다."); logout(); return; }
                        await fetchColumns();
                        setEditingColumn(null);
                        showMsg(editingColumn.id ? "칼럼이 수정되었습니다." : "칼럼이 등록되었습니다.");
                      } catch { showMsg("저장 실패"); } finally { setLoading(false); }
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#8B1A2B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
                  >
                    <Save size={15} /> {editingColumn.id ? "수정 저장" : "등록"}
                  </button>
                  <button onClick={() => setEditingColumn(null)} className="px-5 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition">취소</button>
                </div>
              </div>
            )}

            {columns.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100"><p>등록된 칼럼이 없습니다.</p></div>
            ) : (
              <div className="space-y-3">
                {columns.map((col) => (
                  <div key={col.id} className={`bg-white rounded-xl border p-4 flex gap-4 items-start ${col.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
                    {col.imageUrl && <img src={col.imageUrl} alt={col.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{col.isActive ? "게시중" : "숨김"}</span>
                        {col.category && <span className="text-xs bg-[#fdf3f4] text-[#8B1A2B] px-2 py-0.5 rounded-full">{col.category}</span>}
                        <span className="text-xs text-gray-400">{new Date(col.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                      <p className="font-medium text-gray-900 truncate">{col.title}</p>
                      {col.author && <p className="text-xs text-gray-500 mt-0.5">{col.author}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={async () => { setLoading(true); await fetch("/api/columns", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw, id: col.id, isActive: !col.isActive }) }); await fetchColumns(); setLoading(false); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title={col.isActive ? "숨기기" : "게시하기"}>
                        {col.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => setEditingColumn(col)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"><Edit2 size={16} /></button>
                      <button onClick={async () => { if (!confirm("칼럼을 삭제하시겠습니까?")) return; setLoading(true); await fetch("/api/columns", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw, id: col.id }) }); await fetchColumns(); showMsg("삭제되었습니다."); setLoading(false); }} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 의료진 탭 ── */}
        {tab === "doctors" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">의료진 목록</h2>
              <button
                onClick={() =>
                  setEditingDoctor({
                    slug: "",
                    name: "",
                    title: "원장",
                    subtitle: "",
                    tags: "",
                    bio: "",
                    imageUrl: "",
                    isActive: true,
                  })
                }
                className="flex items-center gap-2 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] transition"
              >
                <Plus size={16} /> 새 의료진
              </button>
            </div>

            {/* 의료진 편집 폼 */}
            {editingDoctor && (
              <div className="bg-white rounded-2xl border border-[#8B1A2B]/20 p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">
                  {editingDoctor.id ? "의료진 수정" : "새 의료진 등록"}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">이름 *</label>
                      <input
                        type="text"
                        value={editingDoctor.name || ""}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                        placeholder="예: 김현규"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">직책</label>
                      <input
                        type="text"
                        value={editingDoctor.title || ""}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, title: e.target.value })}
                        placeholder="예: 대표원장 / 원장"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      URL 주소 (영문 슬러그)
                    </label>
                    <input
                      type="text"
                      value={editingDoctor.slug || ""}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, slug: e.target.value })}
                      placeholder="예: kim (비워두면 자동 생성) · /doctors/kim 으로 접속"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">한 줄 소개</label>
                    <input
                      type="text"
                      value={editingDoctor.subtitle || ""}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, subtitle: e.target.value })}
                      placeholder="예: 몸과 마음의 균형을 돌보는 한의학적 가치"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      전문 분야 태그 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      value={editingDoctor.tags || ""}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, tags: e.target.value })}
                      placeholder="예: 초음파 진단, 통증 치료, 혈액검사 기반 한약"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">프로필 사진</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingDoctor.imageUrl || ""}
                        onChange={(e) => setEditingDoctor({ ...editingDoctor, imageUrl: e.target.value })}
                        placeholder="이미지 URL 또는 아래 업로드"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                      />
                      <label className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition whitespace-nowrap cursor-pointer">
                        <Upload size={14} /> 업로드
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              handleImagePick(file, (url) =>
                                setEditingDoctor((prev) => ({ ...prev, imageUrl: url }))
                              );
                          }}
                        />
                      </label>
                    </div>
                    {editingDoctor.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editingDoctor.imageUrl}
                        alt="미리보기"
                        className="mt-2 h-40 w-32 object-cover object-top rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      원장 인사말 (문단은 빈 줄로 구분)
                    </label>
                    <textarea
                      value={editingDoctor.bio || ""}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                      placeholder={"안녕하세요. ...\n\n두 번째 문단은 빈 줄을 넣어 구분합니다."}
                      rows={10}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B] resize-y"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="docActive"
                      checked={editingDoctor.isActive ?? true}
                      onChange={(e) => setEditingDoctor({ ...editingDoctor, isActive: e.target.checked })}
                      className="accent-[#8B1A2B]"
                    />
                    <label htmlFor="docActive" className="text-sm text-gray-700">
                      홈페이지에 노출
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={saveDoctor}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#8B1A2B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
                  >
                    <Save size={15} /> {editingDoctor.id ? "수정 저장" : "등록"}
                  </button>
                  <button
                    onClick={() => setEditingDoctor(null)}
                    className="px-5 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 의료진 목록 */}
            {doctors.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <p>등록된 의료진이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-xl border p-4 flex gap-4 items-start transition ${
                      doc.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
                    }`}
                  >
                    {doc.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="w-16 h-20 object-cover object-top rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            doc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {doc.isActive ? "노출중" : "숨김"}
                        </span>
                        <span className="text-xs text-gray-400">/doctors/{doc.slug}</span>
                      </div>
                      <p className="font-medium text-gray-900 truncate">
                        {doc.name} <span className="text-[#8B1A2B] text-sm">{doc.title}</span>
                      </p>
                      {doc.subtitle && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{doc.subtitle}</p>
                      )}
                      {doc.tags?.length > 0 && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {doc.tags.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleDoctor(doc)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        title={doc.isActive ? "숨기기" : "노출하기"}
                      >
                        {doc.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => startEditDoctor(doc)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteDoctor(doc.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 인계장 탭 ── */}
        {tab === "handover" && <HandoverTab pw={pw} loginRole={loginRole} />}

        {/* ── 위키 탭 ── */}
        {tab === "wiki" && <WikiTab pw={pw} />}

        {/* ── 팝업 탭 ── */}
        {tab === "popup" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">팝업 설정</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
              {/* 팝업 활성화 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">팝업 표시</p>
                  <p className="text-xs text-gray-500 mt-0.5">홈 접속 시 팝업을 자동으로 표시합니다</p>
                </div>
                <button
                  onClick={() => setPopup({ ...popup, isActive: !popup.isActive })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    popup.isActive
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {popup.isActive ? <Bell size={15} /> : <BellOff size={15} />}
                  {popup.isActive ? "활성화" : "비활성화"}
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">팝업 제목</label>
                <input
                  type="text"
                  value={popup.title}
                  onChange={(e) => setPopup({ ...popup, title: e.target.value })}
                  placeholder="팝업 제목"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">팝업 내용</label>
                <textarea
                  value={popup.content}
                  onChange={(e) => setPopup({ ...popup, content: e.target.value })}
                  placeholder="팝업에 표시할 내용"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">팝업 이미지</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={popup.imageUrl}
                    onChange={(e) => setPopup({ ...popup, imageUrl: e.target.value })}
                    placeholder="이미지 URL 또는 아래 업로드"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                  />
                  <label className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition whitespace-nowrap cursor-pointer">
                    <Upload size={14} /> 업로드
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          handleImagePick(file, (url) => setPopup((prev) => ({ ...prev, imageUrl: url })));
                      }}
                    />
                  </label>
                </div>
                {popup.imageUrl && (
                  <img
                    src={popup.imageUrl}
                    alt="팝업 이미지 미리보기"
                    className="mt-2 h-40 object-cover rounded-lg border border-gray-200"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">버튼 링크</label>
                <input
                  type="text"
                  value={popup.linkUrl}
                  onChange={(e) => setPopup({ ...popup, linkUrl: e.target.value })}
                  placeholder="https://... (버튼 클릭 시 이동할 주소)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">버튼 텍스트</label>
                <input
                  type="text"
                  value={popup.buttonText}
                  onChange={(e) => setPopup({ ...popup, buttonText: e.target.value })}
                  placeholder="자세히 보기"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                />
              </div>

              <button
                onClick={savePopup}
                disabled={loading}
                className="flex items-center gap-2 bg-[#8B1A2B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
              >
                <Save size={16} /> 팝업 설정 저장
              </button>
            </div>
          </div>
        )}

        {/* ── 공휴일 탭 ── */}
        {tab === "holidays" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">공휴일 관리</h2>
            <p className="text-xs text-gray-500 mb-5">
              등록된 날짜는 예약현황판에서 입력된 시각까지만 진료로 표시됩니다. 등록 안 된 평일은 21시까지, 토·일요일은 17시까지 자동 적용됩니다.
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
              {/* 추가 폼 */}
              <div className="flex gap-2 items-end p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">날짜</label>
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">마감 시각 (시)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={newHolidayHour}
                    onChange={(e) => setNewHolidayHour(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
                  />
                </div>
                <button
                  onClick={addHoliday}
                  disabled={loading || !newHolidayDate}
                  className="flex items-center gap-1 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
                >
                  <Plus size={14} /> 추가
                </button>
              </div>

              {/* 목록 */}
              {Object.keys(holidays).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">등록된 공휴일이 없습니다.</p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                  {Object.entries(holidays)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, hour]) => {
                      const d = new Date(date + "T00:00:00");
                      const dayName = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
                      return (
                        <div key={date} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {date} <span className="text-gray-400">({dayName})</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{hour}시까지 진료</p>
                          </div>
                          <button
                            onClick={() => deleteHoliday(date)}
                            disabled={loading}
                            className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm transition disabled:opacity-50"
                          >
                            <Trash2 size={14} /> 삭제
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
