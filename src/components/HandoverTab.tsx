"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";

interface HandoverAccount {
  id: string;
  name: string;
  role: "doc" | "staff";
  since: string;
  memo: string;
}

interface HandoverItem {
  memo: string;
  checked: boolean;
  date: string;
}

interface HandoverData {
  accounts: HandoverAccount[];
  items: Record<string, Record<string, HandoverItem[]>>;
}

const STAFF_PARTS = ["데스크", "행정", "탕전", "치료실"];
const DOC_PARTS = ["진료", "스터디", "행정", "경영"];

const PART_COLOR: Record<string, string> = {
  데스크: "bg-blue-50 border-blue-200 text-blue-700",
  행정: "bg-green-50 border-green-200 text-green-700",
  탕전: "bg-amber-50 border-amber-200 text-amber-700",
  치료실: "bg-red-50 border-red-200 text-red-700",
  진료: "bg-emerald-50 border-emerald-200 text-emerald-700",
  스터디: "bg-purple-50 border-purple-200 text-purple-700",
  경영: "bg-orange-50 border-orange-200 text-orange-700",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function HandoverTab({ pw }: { pw: string }) {
  const [data, setData] = useState<HandoverData>({ accounts: [], items: {} });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePart, setActivePart] = useState("__all__");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: "", role: "staff" as "doc" | "staff", since: today() });
  const memoTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const itemTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const callApi = async (action: string, extra: Record<string, unknown> = {}) => {
    await fetch("/api/handover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, action, ...extra }),
    });
  };

  const fetchData = async () => {
    const res = await fetch(`/api/handover?pw=${encodeURIComponent(pw)}`);
    if (!res.ok) return null;
    return (await res.json()) as HandoverData;
  };

  useEffect(() => {
    fetchData().then((d) => {
      if (d) {
        setData(d);
        if (d.accounts.length > 0) setSelectedId(d.accounts[0].id);
      }
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = async () => {
    const d = await fetchData();
    if (d) setData(d);
    return d;
  };

  const selected = data.accounts.find((a) => a.id === selectedId);
  const parts = selected ? (selected.role === "doc" ? DOC_PARTS : STAFF_PARTS) : [];
  const items = selectedId ? (data.items[selectedId] ?? {}) : {};

  const addAccount = async () => {
    if (!newAcc.name.trim()) return;
    setLoading(true);
    await callApi("add_account", newAcc);
    const d = await reload();
    if (d) {
      const created = d.accounts[d.accounts.length - 1];
      if (created) { setSelectedId(created.id); setActivePart("__all__"); }
    }
    setShowAdd(false);
    setNewAcc({ name: "", role: "staff", since: today() });
    setLoading(false);
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("계정을 삭제하시겠습니까?")) return;
    await callApi("delete_account", { id });
    setData((prev) => {
      const accounts = prev.accounts.filter((a) => a.id !== id);
      const { [id]: _, ...rest } = prev.items;
      return { accounts, items: rest };
    });
    if (selectedId === id) {
      const remaining = data.accounts.filter((a) => a.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
    }
  };

  const updateItem = (part: string, idx: number, field: "memo" | "checked", value: string | boolean) => {
    if (!selectedId) return;
    const cur = data.items[selectedId]?.[part]?.[idx];
    if (!cur) return;
    const newItem: HandoverItem = field === "checked"
      ? { ...cur, checked: value as boolean, date: value ? today() : "" }
      : { ...cur, memo: value as string };

    setData((prev) => {
      const partArr = [...(prev.items[selectedId]?.[part] ?? [])];
      partArr[idx] = newItem;
      return {
        ...prev,
        items: { ...prev.items, [selectedId]: { ...prev.items[selectedId], [part]: partArr } },
      };
    });

    if (field === "checked") {
      callApi("update_item", { accountId: selectedId, part, idx, ...newItem });
    } else {
      const key = `${selectedId}-${part}-${idx}`;
      clearTimeout(itemTimers.current[key]);
      itemTimers.current[key] = setTimeout(() => {
        callApi("update_item", { accountId: selectedId, part, idx, ...newItem });
      }, 600);
    }
  };

  const updateMemo = (id: string, memo: string) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === id ? { ...a, memo } : a)),
    }));
    clearTimeout(memoTimers.current[id]);
    memoTimers.current[id] = setTimeout(() => {
      callApi("update_memo", { id, memo });
    }, 600);
  };

  const addItem = async (part: string) => {
    if (!selectedId) return;
    await callApi("add_item", { accountId: selectedId, part });
    setData((prev) => {
      const partArr = [...(prev.items[selectedId]?.[part] ?? []), { memo: "", checked: false, date: "" }];
      return {
        ...prev,
        items: { ...prev.items, [selectedId]: { ...prev.items[selectedId], [part]: partArr } },
      };
    });
  };

  const renderPartItems = (part: string, compact = false) => {
    const partItems = items[part] ?? [];
    return (
      <div>
        {partItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 py-2 border-b border-black/5 last:border-0">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => updateItem(part, idx, "checked", e.target.checked)}
              className="mt-1 flex-shrink-0 accent-[#8B1A2B]"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={item.memo}
                onChange={(e) => updateItem(part, idx, "memo", e.target.value)}
                placeholder="내용 입력..."
                rows={1}
                className={`w-full text-sm rounded-lg px-2 py-1 resize-none focus:outline-none focus:border-[#8B1A2B] border ${
                  compact ? "bg-white/70 border-black/10" : "bg-gray-50 border-gray-200"
                }`}
              />
              {item.date && <p className="text-xs text-gray-400 mt-0.5">완료 {item.date}</p>}
            </div>
          </div>
        ))}
        <button
          onClick={() => addItem(part)}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-[#8B1A2B] transition"
        >
          <Plus size={12} /> 항목 추가
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">티칭 인계 관리</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] transition"
        >
          <UserPlus size={16} /> 계정 추가
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-[#8B1A2B]/20 p-5 mb-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">새 계정</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">이름</label>
              <input
                type="text"
                value={newAcc.name}
                onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addAccount()}
                placeholder="성함"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">구분</label>
              <select
                value={newAcc.role}
                onChange={(e) => setNewAcc({ ...newAcc, role: e.target.value as "doc" | "staff" })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
              >
                <option value="staff">직원</option>
                <option value="doc">원장님</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">입사일</label>
              <input
                type="date"
                value={newAcc.since}
                onChange={(e) => setNewAcc({ ...newAcc, since: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addAccount}
              disabled={loading}
              className="bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
            >
              추가
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {data.accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p>등록된 계정이 없습니다. 계정을 추가해주세요.</p>
        </div>
      ) : (
        <>
          {/* 계정 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-5">
            {data.accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => { setSelectedId(acc.id); setActivePart("__all__"); }}
                className={`relative bg-white rounded-xl border p-3 cursor-pointer transition group ${
                  selectedId === acc.id
                    ? "border-[#8B1A2B] bg-[#fdf3f4]"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    acc.role === "doc" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {acc.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{acc.name}</p>
                    <p className="text-xs text-gray-400">{acc.role === "doc" ? "원장님" : "직원"} · {acc.since || "-"}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}
                  className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* 선택된 계정 인계 내용 */}
          {selected && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  selected.role === "doc" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {selected.name.slice(0, 2)}
                </div>
                <div>
                  <span className="font-bold text-gray-900">{selected.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{selected.role === "doc" ? "원장님" : "직원"}</span>
                  {selected.since && <span className="text-xs text-gray-400 ml-1">· 입사 {selected.since}</span>}
                </div>
              </div>

              {/* 파트 탭 */}
              <div className="flex gap-1 flex-wrap mb-4">
                <button
                  onClick={() => setActivePart("__all__")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    activePart === "__all__"
                      ? "bg-[#8B1A2B] text-white border-transparent"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  전체보기
                </button>
                {parts.map((part) => (
                  <button
                    key={part}
                    onClick={() => setActivePart(part)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      activePart === part
                        ? "bg-[#8B1A2B] text-white border-transparent"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>

              {/* 전체보기 그리드 */}
              {activePart === "__all__" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {parts.map((part) => (
                    <div key={part} className={`rounded-xl p-4 border ${PART_COLOR[part] ?? "bg-gray-50 border-gray-200 text-gray-700"}`}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3">{part}</p>
                      {renderPartItems(part, true)}
                    </div>
                  ))}
                </div>
              )}

              {/* 단일 파트 */}
              {activePart !== "__all__" && (
                <div className="mb-4">
                  <div className={`inline-flex items-center text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-lg border mb-3 ${PART_COLOR[activePart] ?? ""}`}>
                    {activePart} 파트
                  </div>
                  {renderPartItems(activePart, false)}
                </div>
              )}

              {/* 전달 메모 */}
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">전달 메모</p>
                <textarea
                  value={selected.memo || ""}
                  onChange={(e) => updateMemo(selected.id, e.target.value)}
                  placeholder="인계 전달 사항..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B] resize-none"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
