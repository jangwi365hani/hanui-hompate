import Link from "next/link";

export default function SystemSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] p-6">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-[#1f2937]">시스템 연결 설정 필요</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          현재 <code className="rounded bg-gray-100 px-1 py-0.5">/system</code> 원본이 지정되지 않았습니다.
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Vercel 환경변수에{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">SYSTEM_PROXY_ORIGIN</code> (또는{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">SYSTEM_SCHEDULE_PROXY_ORIGIN</code>) 값을
          스케줄 서버 원본 주소로 설정해 주세요.
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          예시: <code className="rounded bg-gray-100 px-1 py-0.5">https://schedule.example.com</code>
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/admin"
            className="inline-flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            현재 /admin 보기
          </Link>
          <Link
            href="/tangjeon"
            className="inline-flex h-10 items-center rounded-lg bg-[#8b1a2b] px-4 text-sm font-semibold text-white hover:bg-[#781626]"
          >
            /tangjeon 열기
          </Link>
        </div>
      </div>
    </div>
  );
}
