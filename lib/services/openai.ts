import { ThreadMessage } from '@/types/chat'
import OpenAI from 'openai'
import { getSystemPrompt } from '../agent/prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAgentResponse(threadMessages: ThreadMessage[]): Promise<string> {
  const messages = threadMessages.map((msg) => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" as const : "user" as const,
    content: msg.content,
  }))

  const userName = [...threadMessages]
    .reverse()
    .find((msg) => msg.sender_number !== process.env.A1BASE_AGENT_NUMBER!)?.sender_name;

  if (!userName) {
    throw new Error("User's name not found");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: getSystemPrompt(userName) },
      ...messages,
    ],
  })

  return completion.choices[0].message.content || "Sorry, I couldn't generate a response"
}

export async function generateEmailFromThread(threadMessages: ThreadMessage[]): Promise<{
  recipientEmail: string;
  emailContent: {
    subject: string;
    body: string;
  } | null;
}> {
  const lastMessage = threadMessages[threadMessages.length - 1];

  // Extract email using GPT
  const emailExtractionCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Extract any email address from the following message. If no email address is found, respond with 'NO_EMAIL'. Only respond with the email or NO_EMAIL, nothing else."
      },
      {
        role: "user",
        content: lastMessage.content
      }
    ]
  });

  const extractedEmail = emailExtractionCompletion.choices[0].message.content?.trim();

  if (!extractedEmail || extractedEmail === 'NO_EMAIL') {
    return {
      recipientEmail: "",
      emailContent: null
    };
  }

  const recipientEmail = extractedEmail;
  
  // Get the conversation context (last few messages)
  const relevantMessages = threadMessages.slice(-3).map(msg => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" as const : "user" as const,
    content: msg.content,
  }));

  // Generate email content using OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional email composer. Generate a subject line and email body based on the conversation context provided. 
        The email should be professional but maintain a conversational tone. 
        Format your response exactly as follows:
        SUBJECT: <subject line>
        BODY: <email body>`,
      },
      ...relevantMessages,
    ],
  });

  const response = completion.choices[0].message.content;
  
  if (!response) {
    return {
      recipientEmail,
      emailContent: null
    };
  }

  // Parse the response
  const subjectMatch = response.match(/SUBJECT: (.*)/);
  const bodyMatch = response.match(/BODY: ([\s\S]*)/);

  return {
    recipientEmail,
    emailContent: {
      subject: subjectMatch?.[1] || "No subject",
      body: bodyMatch?.[1]?.trim() || "No body content",
    }
  };
}