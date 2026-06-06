export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getColumns } from "@/lib/data";

// HTML 본문에서 태그를 제거해 미리보기용 텍스트만 추출
function toPlain(html: string): string {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function ColumnsPage() {
  const all = await getColumns();
  const columns = all.filter((c) => c.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#8B1A2B] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/" className="hover:opacity-75 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <p className="text-sm opacity-75">장위365경희한의원</p>
            <h1 className="text-2xl font-bold">건강 칼럼</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {columns.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">등록된 칼럼이 없습니다.</p>
            <Link href="/" className="mt-4 inline-block text-[#8B1A2B] hover:underline text-sm">
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {columns.map((col) => (
              <Link
                key={col.id}
                href={`/columns/${col.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {col.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={col.imageUrl}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {col.category && (
                      <span className="text-xs bg-[#fdf3f4] text-[#8B1A2B] font-medium px-2.5 py-1 rounded-full border border-[#f5e0e3]">
                        {col.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(col.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-[#8B1A2B] transition-colors line-clamp-2">
                    {col.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {toPlain(col.content)}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    {col.author && <span>by {col.author}</span>}
                    {col.author && <span className="mx-1.5">·</span>}
                    <span>조회 {(col.views || 0).toLocaleString()}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
