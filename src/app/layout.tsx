import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://jangwi365.com";
const SITE_NAME = "장위365경희한의원";
const SITE_DESC =
  "서울 성북구 장위동 장위365경희한의원. 척추·관절 통증, 다이어트, 여성질환, 비염, 안면마비까지 원인을 치료하는 한의원. 6호선 돌곶이역 도보 5분, 평일 야간·주말·공휴일 진료.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "장위365경희한의원 | 성북구 장위동 · 6호선 돌곶이역 한의원",
    template: "%s | 장위365경희한의원",
  },
  description: SITE_DESC,
  keywords: [
    "장위365경희한의원", "성북구 한의원", "장위동 한의원", "돌곶이역 한의원",
    "척추 관절 한의원", "허리디스크", "목디스크", "한방 다이어트",
    "여성 한의원", "비염 한의원", "안티에이징", "소아 성장", "안면마비", "구안와사",
    "야간진료 한의원", "주말진료 한의원", "방문진료",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "장위365경희한의원 | 성북구 장위동 · 6호선 돌곶이역",
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: "장위365경희한의원",
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MedicalClinic", "MedicalBusiness"],
      "@id": `${SITE_URL}/#clinic`,
      name: SITE_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/images/main.jpg`,
      logo: `${SITE_URL}/images/logo.png`,
      telephone: "+82-2-6952-2800",
      medicineSystem: "https://schema.org/TraditionalChinese",
      priceRange: "₩₩",
      address: {
        "@type": "PostalAddress",
        streetAddress: "장월로38길 4, 타워39 3층",
        addressLocality: "성북구",
        addressRegion: "서울",
        addressCountry: "KR",
      },
      areaServed: "서울 성북구",
      publicAccess: true,
      availableService: [
        { "@type": "MedicalProcedure", name: "척추·관절 통증 클리닉" },
        { "@type": "MedicalProcedure", name: "한방 다이어트 클리닉" },
        { "@type": "MedicalProcedure", name: "여성 클리닉" },
        { "@type": "MedicalProcedure", name: "비염 클리닉" },
        { "@type": "MedicalProcedure", name: "안티에이징 클리닉" },
        { "@type": "MedicalProcedure", name: "소아 성장 클리닉" },
        { "@type": "MedicalProcedure", name: "만성 소화불량 클리닉" },
        { "@type": "MedicalProcedure", name: "안면마비·중풍 클리닉" },
      ],
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "13:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "14:00", closes: "21:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday", "PublicHolidays"], opens: "10:00", closes: "13:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday", "PublicHolidays"], opens: "14:00", closes: "17:00" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}/#clinic` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
