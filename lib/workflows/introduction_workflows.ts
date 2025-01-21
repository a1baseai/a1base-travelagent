

import { A1BaseAPI } from "a1base-node";
import { generateAgentResponse } from "../services/openai";
// import { ThreadMessage } from "@/types/chat";

// Initialize A1Base client
const client = new A1BaseAPI({
  credentials: {
    apiKey: process.env.A1BASE_API_KEY!,
    apiSecret: process.env.A1BASE_API_SECRET!,
  }
});

// Send introduction message when bot joins a chat
export async function SendIntroductionMessage(
  thread_type: "individual" | "group",
  thread_id?: string,
  sender_number?: string,
  userName?: string
) {
  console.log("[SendIntroductionMessage] Sending introduction message", {
    thread_type,
    thread_id,
    sender_number,
    userName,

  });

  try {
    // Generate introduction message using empty thread to get initial greeting
    const introMessage = await generateAgentResponse([]);

    // Prepare message data
    const messageData = {
      content: introMessage,
      from: process.env.A1BASE_AGENT_NUMBER!,
      service: "whatsapp" as const,
    };

    // Send message using A1Base client
    if (thread_type === "group" && thread_id) {
      await client.sendGroupMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...messageData,
        thread_id,
      });
    } else if (thread_type === "individual" && sender_number) {
      await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...messageData,
        to: sender_number,
      });
    } else {
      throw new Error("Invalid message type or missing required parameters");
    }
  } catch (error) {
    console.error("[Introduction Workflow] Error:", error);
    
    // Prepare error message
    const errorMessageData = {
      content: "Sorry, I encountered an error while introducing myself. Please try messaging me again.",
      from: process.env.A1BASE_AGENT_NUMBER!,
      service: "whatsapp" as const,
    };

    // Send error message
    if (thread_type === "group" && thread_id) {
      await client.sendGroupMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...errorMessageData,
        thread_id,
      });
    } else if (thread_type === "individual" && sender_number) {
      await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
        ...errorMessageData,
        to: sender_number,
      });
    }
  }
}
