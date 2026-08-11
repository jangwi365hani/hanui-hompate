import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd, { breadcrumb } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 장위365경희한의원",
  description:
    "장위365경희한의원 홈페이지 커뮤니티 이용에 관한 개인정보 수집·이용 안내입니다. 소셜 로그인 시 별명(닉네임)만 수집하며 이메일·전화번호·생년월일은 수집하지 않습니다.",
  robots: { index: true, follow: true },
};

/**
 * 개인정보처리방침.
 *
 * 커뮤니티(카카오·네이버 로그인)로 개인정보를 받게 되면서 게시가 법정 의무가 됐다
 * (개인정보 보호법 제30조). 실제 수집 항목과 코드가 어긋나면 방침이 아니라 허위 고지가 되므로,
 * 항목을 늘리거나 줄일 때는 반드시 이 페이지도 같이 고칠 것.
 *   - 수집 시점/항목: src/app/api/community/auth/[provider]/callback/route.ts
 *   - 저장 형태:      src/lib/db.ts (community_users)
 *   - 식별자 해시:    src/lib/community-session.ts (hashProviderUid)
 */

const UPDATED_AT = "2026년 8월 11일";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 개인정보 항목과 수집 방법",
    body: (
      <>
        <p>
          장위365경희한의원(이하 &lsquo;한의원&rsquo;)은 홈페이지 커뮤니티 서비스 제공에 필요한
          최소한의 정보만 수집합니다.
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="border border-gray-200 px-4 py-2.5 text-left font-semibold">구분</th>
                <th className="border border-gray-200 px-4 py-2.5 text-left font-semibold">수집 항목</th>
                <th className="border border-gray-200 px-4 py-2.5 text-left font-semibold">수집 방법</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr>
                <td className="border border-gray-200 px-4 py-2.5">커뮤니티 로그인</td>
                <td className="border border-gray-200 px-4 py-2.5">
                  별명(닉네임), 소셜 로그인 제공자 구분(카카오·네이버), 회원 식별값의 암호학적 해시
                </td>
                <td className="border border-gray-200 px-4 py-2.5">
                  이용자가 카카오·네이버 로그인에 동의한 때
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2.5">게시글 작성</td>
                <td className="border border-gray-200 px-4 py-2.5">
                  이용자가 직접 작성한 후기·상담문의의 제목과 내용, 별점, 작성 일시
                </td>
                <td className="border border-gray-200 px-4 py-2.5">이용자가 글을 등록한 때</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2.5">상담신청</td>
                <td className="border border-gray-200 px-4 py-2.5">
                  이름, 연락처(휴대전화번호), 진료 과목, 문의 내용, 신청 일시
                </td>
                <td className="border border-gray-200 px-4 py-2.5">
                  이용자가 화면 하단의 상담신청 양식에 직접 입력하고 동의한 때
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          <strong className="text-gray-800">
            커뮤니티(후기·상담문의)에서는 이름, 이메일 주소, 전화번호, 생년월일, 성별, 프로필 사진을
            수집하지 않습니다. 이름과 연락처는 상담신청을 하신 경우에만 수집합니다.
          </strong>{" "}
          카카오·네이버로부터 회원을 구분하기 위해 전달받는 회원 식별값은 원래의 값을 저장하지 않고
          복원이 불가능한 형태(해시)로 변환하여 보관합니다.
        </p>
        <p className="mt-3">
          홈페이지 이용 과정에서 접속 기록, 브라우저 종류 등 서비스 운영에 필요한 정보가 자동으로
          생성되어 일정 기간 보관될 수 있습니다.
        </p>
      </>
    ),
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>커뮤니티 회원 식별 및 로그인 상태 유지</li>
        <li>이용자가 작성한 후기·상담문의의 게시와 본인 확인</li>
        <li>상담문의에 대한 답변 제공</li>
        <li>상담신청에 대한 전화 회신 및 진료 예약 안내</li>
        <li>중복·도배 게시물 방지 등 커뮤니티 운영 관리</li>
      </ul>
    ),
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    body: (
      <>
        <p>
          수집한 개인정보는 수집·이용 목적이 달성되면 지체 없이 파기합니다. 다만 아래의 경우
          해당하는 기간 동안 보관합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>회원 정보: 이용자가 삭제를 요청하거나 서비스 종료 시까지</li>
          <li>
            상담신청 정보(이름·연락처·문의 내용): 회신이 완료되면 지체 없이 파기하며, 늦어도 접수일로부터
            3개월 이내에 파기합니다
          </li>
          <li>
            이용자가 작성한 게시글: 이용자가 삭제한 시점부터 30일 이내 파기 (상담 답변 이력 확인 및
            분쟁 대응을 위해 일정 기간 보관 후 삭제)
          </li>
          <li>
            관계 법령에 따라 보존이 필요한 경우: 해당 법령에서 정한 기간 (통신비밀보호법에 따른 접속
            기록 3개월 등)
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: (
      <p>
        한의원은 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자가 사전에 동의한 경우,
        또는 법령에 따라 수사기관 등이 적법한 절차를 거쳐 요구하는 경우에는 예외로 합니다.
      </p>
    ),
  },
  {
    title: "5. 개인정보 처리의 위탁",
    body: (
      <>
        <p>
          한의원은 안정적인 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="border border-gray-200 px-4 py-2.5 text-left font-semibold">수탁자</th>
                <th className="border border-gray-200 px-4 py-2.5 text-left font-semibold">위탁 업무</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr>
                <td className="border border-gray-200 px-4 py-2.5">Vercel Inc.</td>
                <td className="border border-gray-200 px-4 py-2.5">홈페이지 서비스 운영 및 호스팅</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2.5">Neon Inc.</td>
                <td className="border border-gray-200 px-4 py-2.5">커뮤니티 데이터베이스 보관</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          위 수탁자의 서버는 국외에 위치할 수 있으며, 위탁 업무 수행 목적 외의 개인정보 처리를
          금지하고 있습니다.
        </p>
      </>
    ),
  },
  {
    title: "6. 이용자의 권리와 행사 방법",
    body: (
      <>
        <p>
          이용자는 언제든지 본인의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>
            본인이 작성한 글은 커뮤니티에서 직접 삭제할 수 있습니다.
          </li>
          <li>
            회원 정보 삭제(탈퇴)나 그 밖의 권리 행사는 아래 담당자 연락처로 요청하시면 지체 없이
            처리해 드립니다.
          </li>
          <li>만 14세 미만 아동의 개인정보는 수집하지 않습니다.</li>
        </ul>
      </>
    ),
  },
  {
    title: "7. 개인정보의 파기 절차 및 방법",
    body: (
      <p>
        보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의
        정보는 복구할 수 없는 방법으로 삭제하며, 출력물 형태의 정보는 분쇄하거나 소각합니다.
      </p>
    ),
  },
  {
    title: "8. 개인정보의 안전성 확보 조치",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>개인정보 취급자를 최소한으로 지정하고 접근 권한을 관리합니다.</li>
        <li>홈페이지 전 구간에 암호화 통신(HTTPS)을 적용합니다.</li>
        <li>
          소셜 로그인 회원 식별값은 원본을 저장하지 않고 복원이 불가능한 해시 형태로만 보관합니다.
        </li>
        <li>로그인 상태를 유지하는 정보는 위조를 방지하기 위해 서명 처리하여 보관합니다.</li>
      </ul>
    ),
  },
  {
    title: "9. 개인정보 보호책임자",
    body: (
      <>
        <p>
          개인정보 처리에 관한 문의, 불만 처리, 피해 구제에 관한 사항은 아래로 연락해 주시기
          바랍니다.
        </p>
        <div className="mt-4 bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong className="text-gray-900">개인정보 보호책임자</strong> · 장위365경희한의원 대표원장
          </p>
          <p className="mt-1">전화: 02-6952-2800</p>
          <p className="mt-1">주소: 서울 성북구 장월로38길 4 타워39 3층</p>
        </div>
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          개인정보 침해에 대한 신고나 상담이 필요하신 경우 개인정보침해신고센터(privacy.kisa.or.kr,
          국번없이 118), 대검찰청 사이버수사과(1301), 경찰청 사이버수사국(182)으로 문의하실 수
          있습니다.
        </p>
      </>
    ),
  },
  {
    title: "10. 개인정보처리방침의 변경",
    body: (
      <p>
        법령이나 서비스 내용의 변경에 따라 이 방침이 수정될 수 있으며, 변경되는 경우 홈페이지를 통해
        공지합니다.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumb([{ name: "개인정보처리방침", path: "/privacy" }])} />

      <div className="bg-[#8B1A2B] text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/" className="hover:opacity-75 transition" aria-label="홈으로">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <p className="text-sm opacity-75">장위365경희한의원</p>
            <h1 className="text-2xl font-bold">개인정보처리방침</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-9">
          <p className="text-sm text-gray-500 leading-relaxed">
            장위365경희한의원은 이용자의 개인정보를 소중히 여기며,{" "}
            <span className="text-gray-800 font-medium">
              홈페이지 커뮤니티 이용에 꼭 필요한 최소한의 정보만
            </span>{" "}
            수집합니다. 이 방침은 홈페이지 커뮤니티 서비스에 적용되며, 진료를 위해 원내에서 수집하는
            정보는 의료법 등 관계 법령에 따라 별도로 관리됩니다.
          </p>

          <div className="mt-8 space-y-9">
            {SECTIONS.map(({ title, body }) => (
              <section key={title}>
                <h2 className="text-[15px] font-bold text-gray-900 mb-3">{title}</h2>
                <div className="text-sm text-gray-600 leading-relaxed space-y-2">{body}</div>
              </section>
            ))}
          </div>

          <p className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500">
            이 개인정보처리방침은 <strong className="text-gray-700">{UPDATED_AT}</strong>부터
            적용됩니다.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/community" className="text-sm text-[#8B1A2B] hover:underline">
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
