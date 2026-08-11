/**
 * 팀 메신저(장위알림봇) 게시 클라이언트.
 *
 * 장위스케쥴의 lib/messenger.js 와 같은 규약을 쓴다 —
 * POST {MESSENGER_URL}/api/bot/post, 헤더 x-bot-token, 본문 { room | roomId | toUserName, text }.
 *
 * 필요 환경변수 (둘 중 하나라도 없으면 조용히 건너뛴다):
 *   MESSENGER_URL        예: https://chat.jangwi365.com
 *   MESSENGER_BOT_TOKEN  메신저 쪽 BOT_TOKEN 과 같은 값
 *   MSG_ROOM_CONSULT     (선택) 알림을 받을 방 이름. 기본 '01_전체소통방&김현규'
 *
 * ⚠️ 방 이름은 메신저에서 **완전일치**로 찾는다. 방 이름이 바뀌면 알림이 조용히 사라지므로
 *    그때는 MSG_ROOM_CONSULT 에 새 이름(또는 방 ID)을 넣는다.
 */

const ROOM = () => process.env.MSG_ROOM_CONSULT || "01_전체소통방&김현규";

export async function postToMessenger(text: string): Promise<boolean> {
  const base = (process.env.MESSENGER_URL || "").replace(/\/+$/, "");
  const token = process.env.MESSENGER_BOT_TOKEN || process.env.BOT_TOKEN || "";
  if (!base || !token) return false;

  try {
    const res = await fetch(`${base}/api/bot/post`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-bot-token": token },
      body: JSON.stringify({ room: ROOM(), text }),
      // 메신저가 느려도 환자 화면을 붙잡아 두지 않는다
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error("[messenger] 게시 실패", res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[messenger] 게시 오류:", (e as Error).message);
    return false;
  }
}

/** 전화번호를 010-1234-5678 형태로. 메신저에서 바로 눌러 걸 수 있게. */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10 && d.startsWith("02")) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return d;
}
