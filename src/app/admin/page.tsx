"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Eye, EyeOff, Save, LogOut, Bell, BellOff, Upload } from "lucide-react";

interface Event {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
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

const STORAGE_KEY = "admin-pw";

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [tab, setTab] = useState<"events" | "popup">("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [popup, setPopup] = useState<Popup>({
    isActive: false,
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "자세히 보기",
  });

  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const popupFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPw(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchEvents();
      fetchPopup();
    }
  }, [authed]);

  const login = () => {
    setPw(pwInput);
    sessionStorage.setItem(STORAGE_KEY, pwInput);
    setAuthed(true);
    setPwError("");
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPw("");
    setPwInput("");
  };

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  const fetchPopup = async () => {
    const res = await fetch("/api/popup");
    const data = await res.json();
    setPopup(data);
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const uploadImage = async (file: File, adminPw: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-password": adminPw },
      body: formData,
    });
    if (!res.ok) throw new Error("업로드 실패");
    const data = await res.json();
    return data.url;
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
    } catch {
      showMsg("이미지 업로드 실패");
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
            onClick={() => setTab("popup")}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${
              tab === "popup"
                ? "border-[#8B1A2B] text-[#8B1A2B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            팝업 관리
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
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleImagePick(file, (url) =>
                              setEditingEvent({ ...editingEvent, imageUrl: url })
                            );
                        }}
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition whitespace-nowrap"
                      >
                        <Upload size={14} /> 업로드
                      </button>
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
                  <input
                    ref={popupFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        handleImagePick(file, (url) => setPopup({ ...popup, imageUrl: url }));
                    }}
                  />
                  <button
                    onClick={() => popupFileRef.current?.click()}
                    className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition whitespace-nowrap"
                  >
                    <Upload size={14} /> 업로드
                  </button>
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
      </div>
    </div>
  );
}
