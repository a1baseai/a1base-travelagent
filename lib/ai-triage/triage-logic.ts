import { generateAgentResponse } from "../services/openai";
import { ThreadMessage } from "@/types/chat";
import { DefaultReplyToMessage, SendEmailFromAgent, ConfirmTaskCompletion, ConstructEmail, waitForUserApproval } from "../workflows/basic_workflow";
import { triageMessageIntent } from "../services/openai";

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
  messagesByThread: Map<string, MessageRecord[]>;
};

export async function triageMessage({
  thread_id,
  content,
  sender_name,
  sender_number,
  thread_type,
  messagesByThread,
}: TriageParams) {
  console.log("[triageMessage] Starting message triage");

  try {
    const threadMessages = messagesByThread.get(thread_id) || [];
    
    // Convert to ThreadMessage format
    const messages: ThreadMessage[] = threadMessages.map(msg => ({
      content: msg.content,
      sender_number: msg.sender_number,
      sender_name: msg.sender_name,
      thread_id,
      thread_type,
      timestamp: msg.timestamp,
      message_id: msg.message_id
    }));

    // Triage message intent
    const triage = await triageMessageIntent(messages);
    
    // Based on the triage result, choose the appropriate workflow
    switch (triage.responseType) {
      case 'handleEmailAction':
        console.log('Running Generate Email')
        // Triage to send an email using the agent's email address
        
        // Confirm email contents with user or ask for follow up
        const emailDraft = await ConstructEmail(threadMessages)

        // await waitForUserApproval(threadMessages, emailDraft)
        
        // await SendEmailFromAgent(threadMessages)

        // Send confirmation message back to user
        await ConfirmTaskCompletion(
          messages,
          thread_type as "individual" | "group", 
          thread_id,
          sender_number
        );
        break;
        
      case 'followUpResponse':
        console.log('Running Follow Up Response')
        // Triage to ask a follow up question
        
        break;
        
      case 'simpleResponse':
      default:
        console.log('Running Default Response')
        // Use the default workflow
        await DefaultReplyToMessage(
          messages,
          thread_type as "individual" | "group",
          thread_id,
          sender_number
        );
    }
  } catch (error) {
    console.error("[Triage] Error:", error);
    throw error;
  }
}
