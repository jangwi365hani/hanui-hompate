"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

type SystemTabKey = "schedule" | "tangjeon";

const SYSTEM_TABS: Record<
  SystemTabKey,
  {
    label: string;
    description: string;
    iframeSrc: string;
    openHref: string;
  }
> = {
  schedule: {
    label: "스케줄 시스템",
    description: "직원 스케줄, 근무시간, 인원 관리",
    iframeSrc: "/system/schedule",
    openHref: "/system/schedule",
  },
  tangjeon: {
    label: "탕전 시스템",
    description: "탕전/조제 업무 관리",
    iframeSrc: "/system/tangjeon",
    openHref: "/system/tangjeon",
  },
};

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<SystemTabKey>("schedule");
  const [frameVersion, setFrameVersion] = useState(0);

  const activeConfig = useMemo(() => SYSTEM_TABS[activeTab], [activeTab]);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="장위365경희한의원 로고"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
              priority
            />
            <div className="leading-tight">
              <p className="text-2xl font-semibold tracking-tight text-[#22242a]">장위365경희한의원</p>
              <p className="text-lg font-semibold text-[#6b7280]">시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFrameVersion((prev) => prev + 1)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
            <Link
              href={activeConfig.openHref}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8b1a2b] px-4 text-sm font-semibold text-white hover:bg-[#781626]"
            >
              새 탭 열기
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(SYSTEM_TABS) as SystemTabKey[]).map((tab) => {
            const config = SYSTEM_TABS[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#8b1a2b] text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {config.label}
              </button>
            );
          })}
          <p className="ml-1 text-sm text-gray-500">{activeConfig.description}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <iframe
            key={`${activeTab}-${frameVersion}`}
            src={activeConfig.iframeSrc}
            title={activeConfig.label}
            className="h-[calc(100vh-180px)] min-h-[640px] w-full"
          />
        </div>

        <p className="text-sm text-gray-500">
          기존 주소도 그대로 사용 가능합니다:{" "}
          <Link href="/admin/login" className="font-medium text-[#8b1a2b] hover:underline">
            /admin/login
          </Link>{" "}
          /{" "}
          <Link href="/tangjeon" className="font-medium text-[#8b1a2b] hover:underline">
            /tangjeon
          </Link>
        </p>
      </main>
    </div>
  );
}
