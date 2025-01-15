import { handleWhatsAppIncoming } from "@/lib/agent/handle-whatsapp-incoming";
import { WhatsAppIncomingData } from "a1base-node";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("[Request Headers]", Object.fromEntries(request.headers));
    console.log("[Request Method]", request.method);

    const body = await request.json() as WhatsAppIncomingData;
    console.log("[Parsed Request Body]", body);

    // Patch bug where group message sender number is missing if sender is a1base agent
    if (body.thread_type === "group" && body.sender_number === "+") {
      body.sender_number = process.env.A1BASE_AGENT_NUMBER!;
    }

    await handleWhatsAppIncoming(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}