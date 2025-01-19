const basicWorkflowsPrompt = {
    "email_generation": {
        "user": "You have been tasked to write an email, given the context of the provided message." +
                "Your task is to:\n" +
                "1) Determine if the message has specified a recipient for the email\n" +
                "2) Extract the email address the email will be sent to, if provided in the message\n" +
                "3) Write an email as requested in the message, given the context provided in the message\n\n" +
                "Write the email in a terse, professional style - being sharp and direct with no fluff, while maintaining a kind tone. " +
                "Always include a subject line.\n\n" +
                "You must respond with the following structure:\n\n" +
                 "{\n" +
                 "    \"has_recipient\": \"true if recipient email is defined in message, false if not\",\n" +
                 "    \"recipient\": \"the recipient of the email\",\n" +
                 "    \"email_content\": \"the contents of the email you were requested to help write\",\n" +
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
    }
};

export { basicWorkflowsPrompt };
