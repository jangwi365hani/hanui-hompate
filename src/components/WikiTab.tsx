"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, Save, X, Search, ChevronLeft, BookOpen } from "lucide-react";
import type { WikiArticle } from "@/lib/data";

interface Props {
  pw: string;
}

const PRESET_CATEGORIES = ["진료·치료", "한약·처방", "증상·질환", "원내 규정", "행정·보험", "기타"];

export default function WikiTab({ pw }: Props) {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [viewing, setViewing] = useState<WikiArticle | null>(null);
  const [editing, setEditing] = useState<Partial<WikiArticle> | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wiki?pw=${encodeURIComponent(pw)}`);
      if (res.ok) setArticles(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return ["전체", ...cats];
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = selectedCategory === "전체" || a.category === selectedCategory;
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, search]);

  const save = async () => {
    if (!editing?.title?.trim()) { showMsg("제목을 입력해주세요."); return; }
    if (!editing?.content?.trim()) { showMsg("내용을 입력해주세요."); return; }
    setLoading(true);
    try {
      const method = editing.id ? "PUT" : "POST";
      const res = await fetch("/api/wiki", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, ...editing }),
      });
      if (!res.ok) { showMsg("저장 실패"); return; }
      await fetchArticles();
      setEditing(null);
      showMsg(editing.id ? "수정되었습니다." : "등록되었습니다.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      await fetch("/api/wiki", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, id }),
      });
      setViewing(null);
      await fetchArticles();
      showMsg("삭제되었습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ── 편집 폼 ──
  if (editing !== null) {
    return (
      <div>
        {msg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
            {msg}
          </div>
        )}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">{editing.id ? "문서 수정" : "새 문서 작성"}</h2>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">제목 *</label>
            <input
              type="text"
              value={editing.title || ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="문서 제목"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {PRESET_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditing({ ...editing, category: c })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    editing.category === c
                      ? "bg-[#8B1A2B] text-white border-[#8B1A2B]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#8B1A2B]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={editing.category || ""}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              placeholder="직접 입력 또는 위에서 선택"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">내용 *</label>
            <textarea
              value={editing.content || ""}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              placeholder="문서 내용을 작성하세요"
              rows={16}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2B] resize-none font-mono"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={loading}
              className="flex items-center gap-2 bg-[#8B1A2B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] disabled:opacity-50 transition"
            >
              <Save size={15} /> 저장
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-5 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 문서 보기 ──
  if (viewing !== null) {
    const article = articles.find((a) => a.id === viewing.id) ?? viewing;
    return (
      <div>
        {msg && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
            {msg}
          </div>
        )}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setViewing(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-xs bg-[#fdf3f4] text-[#8B1A2B] px-2 py-0.5 rounded-full mr-2">{article.category}</span>
            <span className="text-xs text-gray-400">
              {new Date(article.updatedAt).toLocaleDateString("ko-KR")} 수정
            </span>
          </div>
          <button
            onClick={() => setEditing(article)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Edit2 size={14} /> 수정
          </button>
          <button
            onClick={() => remove(article.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> 삭제
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">{article.title}</h2>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{article.content}</pre>
        </div>
      </div>
    );
  }

  // ── 목록 ──
  return (
    <div>
      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50">
          {msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={20} className="text-[#8B1A2B]" /> 내부 위키
        </h2>
        <button
          onClick={() => setEditing({ title: "", content: "", category: "일반" })}
          className="flex items-center gap-2 bg-[#8B1A2B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7a1626] transition"
        >
          <Plus size={16} /> 새 문서
        </button>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목 또는 내용 검색"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8B1A2B]"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              selectedCategory === cat
                ? "bg-[#8B1A2B] text-white border-[#8B1A2B]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#8B1A2B]"
            }`}
          >
            {cat}
            {cat !== "전체" && (
              <span className="ml-1 opacity-60">
                {articles.filter((a) => a.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 문서 목록 */}
      {loading && articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          {search ? `"${search}" 검색 결과가 없습니다.` : "등록된 문서가 없습니다."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((article) => (
            <button
              key={article.id}
              onClick={() => setViewing(article)}
              className="w-full text-left bg-white rounded-xl border border-gray-100 px-5 py-4 hover:border-[#8B1A2B]/30 hover:shadow-sm transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-[#fdf3f4] text-[#8B1A2B] px-2 py-0.5 rounded-full shrink-0">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(article.updatedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 truncate group-hover:text-[#8B1A2B] transition">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {article.content.slice(0, 80)}
                  </p>
                </div>
                <ChevronLeft size={16} className="text-gray-300 rotate-180 shrink-0 mt-1 group-hover:text-[#8B1A2B] transition" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
