export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getColumns } from "@/lib/data";
import { notFound } from "next/navigation";
import ColumnView from "./ColumnView";

export default async function ColumnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await getColumns();
  const col = all.find((c) => c.id === id && c.isActive);
  if (!col) notFound();

  const others = all.filter((c) => c.isActive && c.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#8B1A2B] text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/columns" className="hover:opacity-75 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <p className="text-sm opacity-75">장위365경희한의원</p>
            <p className="font-bold">건강 칼럼</p>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-10">
        {col.category && (
          <span className="text-xs bg-[#fdf3f4] text-[#8B1A2B] font-medium px-3 py-1 rounded-full border border-[#f5e0e3]">
            {col.category}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-3 leading-tight">
          {col.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
          {col.author && <span className="font-medium text-gray-600">{col.author}</span>}
          <span>
            {new Date(col.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
          <span aria-label="조회수">조회 {((col.views || 0) + 1).toLocaleString()}</span>
        </div>
        <ColumnView id={col.id} />

        {col.imageUrl && (
          <img
            src={col.imageUrl}
            alt={col.title}
            className="w-full h-auto rounded-2xl mb-8"
          />
        )}

        {/<[a-z][\s\S]*>/i.test(col.content) ? (
          <div
            className="rich-content text-gray-700 leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: col.content }}
          />
        ) : (
          <div className="text-gray-700 leading-relaxed text-[15px]">
            {col.content.split("\n").map((para, i) =>
              para.trim() ? (
                <p key={i} className="mb-4">{para}</p>
              ) : (
                <br key={i} />
              )
            )}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100">
          <Link
            href="/columns"
            className="inline-flex items-center gap-2 text-sm text-[#8B1A2B] hover:underline"
          >
            <ArrowLeft size={14} /> 목록으로
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">다른 칼럼</h3>
            <div className="space-y-3">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/columns/${o.id}`}
                  className="flex gap-4 items-start group p-3 rounded-xl hover:bg-gray-50 transition"
                >
                  {o.imageUrl && (
                    <img src={o.imageUrl} alt={o.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-[#8B1A2B] transition line-clamp-2">
                      {o.title}
                    </p>
                    {o.author && <p className="text-xs text-gray-400 mt-1">{o.author}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
