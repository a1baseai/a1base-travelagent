import { A1BaseAPI, WhatsAppIncomingData } from 'a1base-node';
import { generateAgentResponse } from "../services/openai";

// Initialize A1Base client
const credentials = {
  apiKey: process.env.A1BASE_API_KEY!,
  apiSecret: process.env.A1BASE_API_SECRET!,
};
const client = new A1BaseAPI({
  credentials
});

// In-memory storage (Note: This will reset on server restart)
const messagesByThread = new Map();

function saveMessage(threadId: string, message: {
  message_id: string;
  content: string;
  sender_number: string;
  sender_name: string;
  timestamp: string;
}) {
  const threadMessages = messagesByThread.get(threadId) || [];
  threadMessages.push(message);
  messagesByThread.set(threadId, threadMessages);
}

export async function handleWhatsAppIncoming({
  thread_id,
  message_id,
  content,
  sender_name,
  sender_number,
  thread_type,
  timestamp,
}: WhatsAppIncomingData) {
  console.log("[Message Received]", {
    thread_id,
    message_id,
    content,
    sender_number,
    sender_name,
    thread_type,
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
  if (sender_number === process.env.A1BASE_AGENT_NUMBER!) {
    return;
  }

  try {
    const threadMessages = messagesByThread.get(thread_id) || [];
    console.log("[Thread Messages]", threadMessages);

    const aiResponse = await generateAgentResponse(threadMessages);
    console.log("[AI Response]", aiResponse);

    // Shared message data
    const messageData = {
      content: aiResponse,
      from: process.env.A1BASE_AGENT_NUMBER!,
      service: 'whatsapp',
    };

    // Send message using A1Base client
    if (thread_type === "group") {
      await client.sendGroupMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...messageData,
        thread_id: thread_id,
      });
    } else {
      await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...messageData,
        to: sender_number,
      });
    }
  } catch (error) {
    console.error("[Chat] Error:", error);

    // Shared error message data
    const errorMessageData = {
      content: "Sorry, I encountered an error processing your message",
      from: process.env.A1BASE_AGENT_NUMBER!,
      service: 'whatsapp',
    };

    // Send error message using A1Base client
    if (thread_type === "group") {
      await client.sendGroupMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...errorMessageData,
        thread_id: thread_id,
      });
    } else {
      await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...errorMessageData,
        to: sender_number,
      });
    }
  }
}
