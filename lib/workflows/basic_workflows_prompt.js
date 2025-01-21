const basicWorkflowsPrompt = {
    "email_generation": {
        "user": "You have been tasked to write an email, given the context of the provided message." +
                "Your task is to:\n" +
                "1) Determine if the message has specified a recipient for the email and extract the recipient email address\n" +
                "2) Extract the email address the email will be sent to, if provided in the message\n" +
                "3) Write an email as requested in the message, given the context provided in the message\n\n" +
                "Write the email in a terse, professional style - being sharp and direct with no fluff, while maintaining a kind tone. " +
                "Always include a subject line.\n\n" +
                "You must respond with the following structure:\n\n" +
                 "{\n" +
                 "    \"hasRecipient\": \"true if recipient email is defined in message, false if not\",\n" +
                 "    \"recipientEmail\": \"the recipient email address, as extracted from the message\",\n" +
                 "    \"emailContent\": \"the contents of the email you were requested to help write, in html for email.\",\n" +
                 "    \"subject\": \"the subject line for the email reply\",\n" +
                 "    \"reasoning\": \"reasoning for your email\"\n" +
                 "}"
    },
    "simple_response": {
        "user": "You have been tasked to write a response to the given message.\n" +
                "You take the responsibility seriously, but you speak kindly, sharply, and terse with no fluff.\n\n" +
                "You must respond with the following structure:\n\n" +
                "{\n" +
                "    \"message\": \"your response to the message\",\n" +
                "    \"reasoning\": \"reasoning for your response\"\n" +
                "}"
    },
    "task_confirmation": {
        "user": "Generate a terse, short message confirming with the user if they want you to proceed with the given task.\n" +
                "Review the task details and create a clear summary asking for user approval.\n" +
                "Be specific about what will be done and what the outcome will be.\n\n" +
                "You must respond with the following structure:\n\n" +
                "{\n" +
                "    \"message\": \"your confirmation request message clearly stating the task and asking for approval\",\n" +
                "    \"reasoning\": \"reasoning for how you summarized the task\"\n" +
                "}"
    },
    "hotel_response": {
        "user": "You have been tasked to write a concise response about a hotel request.\n" +
                "Include options for the user's stay, any relevant details (pricing, check-in/out times), and maintain a courteous tone.\n\n" +
                "You must respond with the following structure:\n\n" +
                "{\n" +
                "    \"message\": \"your response to the users hotel related inquiry. Format the response beautifully.\",\n" +
                "    \"reasoning\": \"reasoning for your response\"\n" +
                "}"
    },
    "flight_response": {
        "user": "You have been tasked to write a concise response to a flight-related inquiry.\n" +
                "Include relevant flight details (departure, arrival times, or suggestions) and maintain a courteous tone.\n\n" +
                "You must respond with the following structure:\n\n" +
                "{\n" +
                "    \"message\": \"your response regarding the flight\",\n" +
                "    \"reasoning\": \"reasoning for your response\"\n" +
                "}"
    }
};

export { basicWorkflowsPrompt };
