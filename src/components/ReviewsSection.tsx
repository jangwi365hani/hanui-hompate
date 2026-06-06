"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((list: Review[]) => setReviews((Array.isArray(list) ? list : []).filter((r) => r.isActive)))
      .catch(() => {});
  }, []);

  if (!reviews.length) return null;

  return (
    <section id="reviews" className="py-28 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.2em] text-[#8B1A2B] font-semibold uppercase">Reviews</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-3">환자 후기</h2>
          <p className="text-gray-500 mt-3 flex items-center justify-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-4 h-4 bg-[#03C75A] text-white rounded-sm text-[10px] font-black leading-none">N</span>
            네이버에 남겨주신 실제 후기입니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((rv) => (
            <div key={rv.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={16}
                    className={n <= (rv.rating || 5) ? "text-[#FFB400] fill-[#FFB400]" : "text-gray-200 fill-gray-200"}
                  />
                ))}
              </div>
              {rv.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={rv.imageUrl} alt="" className="w-full rounded-xl mb-3 object-cover max-h-48" />
              )}
              <p className="text-gray-700 text-[15px] leading-relaxed flex-1 whitespace-pre-line">{rv.content}</p>
              <p className="text-sm text-gray-400 mt-4 font-medium">— {rv.author || "익명"}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://m.place.naver.com/hairshop/567280/review/visitor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#03C75A] text-white font-bold px-7 py-3 rounded-full hover:bg-[#02b350] transition-colors text-sm"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-xs font-black leading-none">N</span>
            네이버에서 더 많은 후기 보기
          </a>
        </div>
      </div>
    </section>
  );
}
