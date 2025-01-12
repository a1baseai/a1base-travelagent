import { handleWhatsAppIncoming } from "@/lib/agent/handle-whatsapp-incoming";
import { WhatsAppIncomingData } from "a1base-node";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("[Request Headers]", Object.fromEntries(request.headers));
    console.log("[Request Method]", request.method);

    const body = await request.json() as WhatsAppIncomingData;
    console.log("[Parsed Request Body]", body);

    // Patch bug where sender_number is not prefixed with +
    let sender_number = "+" + body.sender_number;

    // Patch bug where group message sender number is missing if sender is a1base agent
    if (body.thread_type === "group" && sender_number === "+") {
      sender_number = process.env.A1BASE_AGENT_NUMBER!;
    }

    await handleWhatsAppIncoming({
      ...body,
      sender_number,
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