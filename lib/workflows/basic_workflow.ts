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

// DEFAULT: SEND SIMPLE RESPONSE TO USER
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

// ============================== EMAIL WORKFLOWS ========================
// Functions for handling email-related tasks like constructing and sending emails
// through the A1 agent's email address. These workflows are triggered when the
// message triage detects an email-related request from the user.
// =======================================================================

// GENERATE EMAIL CONTENT TO BE SENT BY THE A1 AGENT
// ConstructEmail generates the contents of the email, but doesn't send it
// until approved by user in 
export async function ConstructEmail(threadMessages: ThreadMessage[]): Promise<{
  recipientEmail: string;
  emailContent: {
    subject: string;
    body: string;
  };
}> {
    // Generate email contents
    const emailData = await generateEmailFromThread(threadMessages, basicWorkflowsPrompt.email_generation.user);

    if (!emailData.emailContent) {
        throw new Error("Email content could not be generated.");
    }

    return {
        recipientEmail: emailData.recipientEmail,
        emailContent: emailData.emailContent
    };
}

//
export async function waitForUserApproval(threadMessages: ThreadMessage[]): Promise<{
    recipientEmail: string;
    emailContent: {
      subject: string;
      body: string;
    };
}> {
    // Generate email contents
    const emailData = await generateEmailFromThread(threadMessages, basicWorkflowsPrompt.email_generation.user);

    if (!emailData.emailContent) {
        throw new Error("Email content could not be generated.");
    }

    return {
        recipientEmail: emailData.recipientEmail,
        emailContent: emailData.emailContent
    };
}

// SEND EMAIL AS A1 AGENT TO THE RECIPIENT SPECIFIED IN THE MESSAGE
export async function SendEmailFromAgent(emailData: {
    recipientEmail: string;
    emailContent: {
      subject: string;
      body: string;
    };
  }) {
  try {
    
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

// CONFIRM TASK COMPLETION WITH USER
// This function sends a confirmation message back to the user after completing a task
// It helps maintain a human-in-the-loop feedback cycle by explicitly confirming 
// that their request was handled and giving them an opportunity to follow up if needed
export async function ConfirmTaskCompletion(
  threadMessages: ThreadMessage[],
  thread_type: "individual" | "group",
  thread_id?: string,
  sender_number?: string
) {
  console.log("[ConfirmTaskCompletion] Confirming task completion", {
    thread_type,
    thread_id,
    sender_number,
    message_count: threadMessages.length
  });

  try {
    // You can optionally use an AI-generated response using generateAgentResponse
    // For now, we'll keep it a simple fixed message
    const confirmationMessage = "Great news! Your request has been successfully completed. Let us know if you need anything else.";

    // Prepare message data
    const messageData = {
      content: confirmationMessage,
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
    console.error("[ConfirmTaskCompletion] Error:", error);

    // Prepare error message
    const errorMessageData = {
      content: "Sorry, I encountered an error confirming task completion",
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