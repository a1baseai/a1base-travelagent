import { A1BaseAPI } from "a1base-node";
import { generateAgentResponse, generateEmailFromThread } from "../services/openai";
import { ThreadMessage } from "@/types/chat";

// Initialize A1Base client
const client = new A1BaseAPI({
  credentials: {
    apiKey: process.env.A1BASE_API_KEY!,
    apiSecret: process.env.A1BASE_API_SECRET!,
  }
});

// DEFAULT: SEND RESPOND TO USER
export async function DefaultReplyToMessage(
  threadMessages: ThreadMessage[],
  thread_type: "individual" | "group",
  thread_id?: string,
  sender_number?: string
) {
  console.log("[DefaultReplyToMessage] Running default response workflow", {
    thread_type,
    thread_id,
    sender_number,
    message_count: threadMessages.length
  });

  try {
    // Generate AI response
    const response = await generateAgentResponse(threadMessages);

    // Prepare message data
    const messageData = {
      content: response,
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
    console.error("[Basic Workflow] Error:", error);

    // Prepare error message
    const errorMessageData = {
      content: "Sorry, I encountered an error processing your message",
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

// SAVE DATA FLOW

// SEND EMAIL FLOW
export async function SendEmailFromAgent(threadMessages: ThreadMessage[]) {
    try {
      // Generate email content from thread
      const emailContent = await generateEmailFromThread(threadMessages);

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailContent.recipientEmail,
          from: process.env.AGENT_EMAIL_ADDRESS!,
          subject: 'Message from AI Agent',
          text: emailContent,
          html: `<p>${emailContent}</p>`
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('[sendEmailFromAgent] Error:', error);
      throw error;
    }
}