import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const DOCTOR_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "admin1234";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}");
        if (payload.password !== DOCTOR_PASSWORD && payload.password !== STAFF_PASSWORD) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
