/**
 * 커뮤니티 화면과 API가 함께 쓰는 타입.
 * 클라이언트 컴포넌트도 import 하므로 이 파일에는 서버 전용 모듈(db, node:crypto)을 넣지 않는다.
 */

export type PostKind = "review" | "inquiry";
export type PostStatus = "pending" | "published" | "rejected" | "hidden";

export interface Reply {
  id: number;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface Post {
  id: number;
  kind: PostKind;
  title: string;
  content: string;
  rating: number | null;
  status: PostStatus;
  isPrivate: boolean;
  rejectMemo: string;
  nickname: string;
  createdAt: string;
  /** 현재 로그인 사용자가 쓴 글인지 — 목록에서 "내 글" 표시와 삭제 버튼 노출에 쓴다 */
  isMine: boolean;
  replies: Reply[];
  /** 상담문의에서 남의 글일 때 true — 제목만 보이고 본문·답변은 서버가 내려주지 않는다 */
  locked?: boolean;
  /** 잠긴 글에도 "답변완료" 여부는 보여준다 */
  replyCount?: number;
  /** 상담문의 게시판 글번호 (최신 글이 가장 큰 번호) */
  seq?: number;
}

export interface SessionInfo {
  loggedIn: boolean;
  nickname: string;
  provider?: "kakao" | "naver";
}

export const KIND_LABEL: Record<PostKind, string> = {
  review: "병원후기",
  inquiry: "상담문의",
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  pending: "검토 중",
  published: "게시됨",
  rejected: "게시 보류",
  hidden: "숨김",
};
