import { NextResponse } from "next/server";
import { WhatsAppRequestBody } from "@/types/chat";
import { AGENT_NUMBER } from "@/lib/chat-config";
import { generateAgentResponse } from "@/lib/openai-service";
import { sendWhatsAppMessage } from "@/lib/whatsapp-service";

// In-memory storage (Note: This will reset on server restart)
const messagesByThread = new Map();

function saveMessage(threadId: string, message: any) {
  const threadMessages = messagesByThread.get(threadId) || [];
  threadMessages.push(message);
  messagesByThread.set(threadId, threadMessages);
}

export async function POST(request: Request) {
  try {
    console.log("[Request Headers]", Object.fromEntries(request.headers));
    console.log("[Request Method]", request.method);

    const rawBody = await request.text();
    console.log("[Raw Request Body]", rawBody);

    const body = JSON.parse(rawBody) as WhatsAppRequestBody;
    console.log("[Parsed Request Body]", body);

    let {
      thread_id,
      message_id,
      content,
      sender_number,
      sender_name,
      timestamp,
    } = body;
    sender_number = "+" + sender_number;

    console.log("[Message Received]", {
      thread_id,
      message_id,
      content,
      sender_number,
      sender_name,
      timestamp,
    });

    // Store message
    saveMessage(thread_id, {
      message_id,
      content,
      sender_number,
      sender_name,
      timestamp,
    });

    // Only respond to user messages
    if (sender_number !== AGENT_NUMBER) {
      try {
        const threadMessages = messagesByThread.get(thread_id) || [];
        console.log("[Thread Messages]", threadMessages);

        const aiResponse = await generateAgentResponse(threadMessages);
        console.log("[AI Response]", aiResponse);

        await sendWhatsAppMessage(sender_number, aiResponse);
      } catch (error) {
        console.error("[Chat] Error:", error);
        await sendWhatsAppMessage(
          sender_number,
          "Sorry, I encountered an error processing your message"
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
