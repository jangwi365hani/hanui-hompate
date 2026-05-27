import Link from "next/link";

export default function SystemTangjeonSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] p-6">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-[#1f2937]">탕전 시스템 연결 준비</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          아직 <code className="rounded bg-gray-100 px-1 py-0.5">SYSTEM_TANGJEON_PROXY_ORIGIN</code> (또는{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">TANGJEON_PROXY_ORIGIN</code>)이 설정되지 않아
          이 화면이 표시됩니다.
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Vercel 환경변수에 탕전 시스템 원본 서버 주소를 넣으면 이 경로는 자동으로 실제 탕전 시스템으로 연결됩니다.
        </p>
        <Link
          href="/system"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-[#8b1a2b] px-4 text-sm font-semibold text-white hover:bg-[#781626]"
        >
          시스템 화면으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
