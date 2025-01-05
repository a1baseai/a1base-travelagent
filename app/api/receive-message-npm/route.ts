import { NextResponse } from "next/server";
import { WhatsAppRequestBody } from "@/types/chat";
import { A1BaseAPI } from 'a1base-node';
import { AGENT_NUMBER } from "@/lib/chat-config";
import { generateAgentResponse } from "@/lib/openai-service";

// Initialize A1Base client
const credentials = {
  apiKey: process.env.A1BASE_API_KEY!,
  apiSecret: process.env.A1BASE_API_SECRET!,
};
const baseURL = 'https://api.a1base.com/v1/messages';
const client = new A1BaseAPI(credentials, baseURL);

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

        // Send message using A1Base client
        const messageData = {
          content: aiResponse,
          from: AGENT_NUMBER,
          to: sender_number,
          service: 'whatsapp'
        };

        await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, messageData);
      } catch (error) {
        console.error("[Chat] Error:", error);
        
        // Send error message using A1Base client
        const errorMessageData = {
          content: "Sorry, I encountered an error processing your message",
          from: AGENT_NUMBER,
          to: sender_number,
          service: 'whatsapp'
        };
        
        await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, errorMessageData);
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