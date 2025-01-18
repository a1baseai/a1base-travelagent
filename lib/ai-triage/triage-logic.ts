import { generateAgentResponse } from "../services/openai";
import { A1BaseAPI } from "a1base-node";

type MessageRecord = {
  message_id: string;
  content: string;
  sender_number: string;
  sender_name: string;
  timestamp: string;
};

type TriageParams = {
  thread_id: string;
  message_id: string;
  content: string;
  sender_name: string;
  sender_number: string;
  thread_type: string;
  timestamp: string;
  client: A1BaseAPI;
  messagesByThread: Map<string, MessageRecord[]>;
};

export async function triageMessage({
  thread_id,
  message_id,
  content,
  sender_name,
  sender_number,
  thread_type,
  timestamp,
  client,
  messagesByThread,
}: TriageParams) {
  try {
    const threadMessages = messagesByThread.get(thread_id) || [];
    console.log("[Thread Messages]", threadMessages);

    const aiResponse = await generateAgentResponse(threadMessages);
    console.log("[AI Response]", aiResponse);

    // Shared message data
    const messageData = {
      content: aiResponse,
      from: process.env.A1BASE_AGENT_NUMBER!,
      service: "whatsapp",
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
      service: "whatsapp",
    };

    // Send error message
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
