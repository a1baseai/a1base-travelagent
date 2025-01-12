import { handleWhatsAppIncoming } from "@/lib/agent/handle-whatsapp-incoming";
import type { WhatsAppRequestBody } from "@/types/chat";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("[Request Headers]", Object.fromEntries(request.headers));
    console.log("[Request Method]", request.method);

    const body = await request.json() as WhatsAppRequestBody;
    console.log("[Parsed Request Body]", body);

    await handleWhatsAppIncoming({
      ...body,

      // Patch bug where sender_number is not prefixed with +
      sender_number: "+" + body.sender_number,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}