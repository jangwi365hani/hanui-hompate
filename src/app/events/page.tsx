export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEvents } from "@/lib/data";

export default async function EventsPage() {
  const allEvents = await getEvents();
  const events = allEvents.filter((e) => e.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#8B1A2B] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/" className="hover:opacity-75 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <p className="text-sm opacity-75">장위365경희한의원</p>
            <h1 className="text-2xl font-bold">이벤트 · 공지</h1>
          </div>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">현재 진행 중인 이벤트가 없습니다.</p>
            <Link href="/" className="mt-4 inline-block text-[#8B1A2B] hover:underline text-sm">
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full object-cover max-h-72"
                  />
                )}
                <div className="p-6">
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(event.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h2>
                  {event.content && (
                    <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed mb-4">
                      {event.content}
                    </p>
                  )}
                  {event.linkUrl && (
                    <a
                      href={event.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#8B1A2B] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#7a1626] transition"
                    >
                      자세히 보기
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
