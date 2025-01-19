import { A1BaseAPI } from "a1base-node";
import { triageMessageIntent, generateAgentResponse, generateEmailFromThread } from "../services/openai";
import { ThreadMessage } from "@/types/chat";
import { basicWorkflowsPrompt } from "./basic_workflows_prompt";

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
    // Use the 'simple_response' prompt
    const response = await generateAgentResponse(threadMessages, basicWorkflowsPrompt.simple_response.user);

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

// SEND EMAIL 
// Construct and send an email from the A1_Agent_Email to a email specified in the message
export async function SendEmailFromAgent(threadMessages: ThreadMessage[]) {
  try {
    // Generate email contents
    const emailData = await generateEmailFromThread(threadMessages, basicWorkflowsPrompt.email_generation.user);

    if (!emailData.emailContent) {
      throw new Error("Email content could not be generated.");
    }
    
    const response = await client.sendEmailMessage(process.env.A1BASE_ACCOUNT_ID!, {
      sender_address: process.env.A1BASE_AGENT_EMAIL!,
      recipient_address: emailData.recipientEmail,
      subject: emailData.emailContent.subject,
      body: emailData.emailContent.body,
      headers: {
        // Optional headers
        // TODO: Add example with custom headers
      }
    });

    return response;
  } catch (error) {
    console.error('[SendEmailFromAgent] Error:', error);
    throw error;
  }
}