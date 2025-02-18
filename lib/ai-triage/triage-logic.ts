import { ThreadMessage } from "@/types/chat";
import { 
  DefaultReplyToMessage,
  SendEmailFromAgent, 
  ConfirmTaskCompletion,
  ConstructEmail,
  // taskActionConfirmation,
  verifyAgentIdentity
} from "../workflows/basic_workflow";
import { 
  // generateAgentResponse,
  triageMessageIntent 
} from "../services/openai";

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

// ======================== MAIN TRIAGE LOGIC ========================
// Processes incoming messages and routes them to appropriate workflows
// in basic_workflow.ts. Currently triages for:
// - Simple response to one off message
// - Sharing A1 Agent Identity card
// - Drafting and sending an email
// ===================================================================
export async function triageMessage({
  thread_id,
  content,
  sender_name,
  sender_number,
  thread_type,
  messagesByThread,
}: TriageParams) {
  console.log('Triage message received:', { thread_id, content, sender_name, sender_number, thread_type });

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

    
    const triage = await triageMessageIntent(messages);
    // Based on the triage result, choose the appropriate workflow
    
    switch (triage.responseType) {
      case 'sendIdentityCard':
        console.log('Running Identity Verification Workflow')
      
        await verifyAgentIdentity(
          threadMessages[threadMessages.length - 1].content,
          thread_type as "individual" | "group",
          thread_id,
          sender_number
        )
        

      break;

      case 'handleEmailAction':
        console.log('Running Email Workflow')
        // Triage to send an email using the agent's email address
        
        const emailDraft = await ConstructEmail(threadMessages)
              
        // Get user confirmation and send email
        // const confirmedEmail = await taskActionConfirmation(threadMessages, emailDraft);
       
        await SendEmailFromAgent(
          emailDraft, 
          thread_type as "individual" | "group", 
          thread_id, 
          sender_number
        );

        // Send confirmation message back to user
        await ConfirmTaskCompletion(
          messages,
          thread_type as "individual" | "group", 
          thread_id,
          sender_number
        );
        break;

      // case 'taskActionConfirmation':
      //   console.log('Running Task Confirmation Workflow')
      //   // Confirm completion of a specific task
      //   await ConfirmTaskCompletion(
      //     messages,
      //     thread_type as "individual" | "group",
      //     thread_id,
      //     sender_number
      //   );
      //   break;
        
      // case 'followUpResponse':
      //   console.log('Running Follow Up Response')
      //   // Triage to ask a follow up question
        
      //   break;
        
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
