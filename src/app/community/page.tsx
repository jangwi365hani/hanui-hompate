import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd, { breadcrumb } from "@/components/JsonLd";
import CommunityBoard from "@/components/CommunityBoard";

export const metadata: Metadata = {
  title: "커뮤니티 · 장위365경희한의원",
  description:
    "장위365경희한의원 커뮤니티입니다. 증상·치료·예약에 대한 상담문의를 남기시면 병원이 답변드립니다. 문의 내용과 답변은 작성자 본인과 병원만 볼 수 있습니다. 카카오·네이버 간편 로그인.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumb([{ name: "커뮤니티", path: "/community" }])} />

      {/* 헤더 — 다른 서브페이지와 같은 형태 */}
      <div className="bg-[#8B1A2B] text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/" className="hover:opacity-75 transition" aria-label="홈으로">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <p className="text-sm opacity-75">장위365경희한의원</p>
            <h1 className="text-2xl font-bold">커뮤니티</h1>
          </div>
        </div>
      </div>

      <CommunityBoard />

      <footer className="max-w-3xl mx-auto px-4 pb-14">
        <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-200 pt-5">
          게시된 후기는 환자 개인의 경험으로, 동일한 치료 효과를 보장하지 않습니다. 증상과 치료
          경과는 개인에 따라 다를 수 있으며, 정확한 진단과 치료는 내원 후 진료를 통해 이루어집니다.
          작성된 글은 관련 법령에 따라 검토 후 게시되며, 광고·비방·개인정보가 포함된 글은 사전 통보
          없이 게시가 보류될 수 있습니다.
        </p>
      </footer>
    </div>
  );
}
