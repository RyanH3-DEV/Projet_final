const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const askMistral = async (messageText) => {
    try {
        const response = await fetch(`${BASE_URL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) {
            throw new Error(`chatbot.api.server_error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.reply) {
            throw new Error("chatbot.api.invalid_format");
        }

        return data.reply;

    } catch (error) {
        console.error("chatbot.api.call_error", error);
        throw error;
    }
};