// frontend/src/api/chatbotApi.js

// Je vérifie quel port j'utilise pour Symfony (8000 ou 3305)
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
            // Je renvoie la clé accompagnée du code HTTP pour le débogage
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