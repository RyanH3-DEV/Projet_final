import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { askMistral } from '../api/chatbotApi';
import { Bot, Send, MessageCircle, X, User } from 'lucide-react';
import '../Style_localisés/Chatbot.css';

function Chatbot() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'bot', content: t('chatbot.ui.welcome') }
    ]);
    const [chargement, setChargement] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, chargement]);

    const envoyerMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || chargement) return;

        const userMsg = input.trim();
        setInput('');

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChargement(true);

        try {
            const resultat = await askMistral(userMsg);
            setMessages(prev => [...prev, { role: 'bot', content: resultat }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', content: t('chatbot.ui.error') }]);
        } finally {
            setChargement(false);
        }
    };

    return (
        <>
            <button className="chatbot-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <Bot size={20} />
                        <span>{t('chatbot.ui.title')}</span>
                        <X size={18} style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                    </div>

                    <div className="chatbot-messages" ref={scrollRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}`}>
                                {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                                <span>{msg.content}</span>
                            </div>
                        ))}
                        {chargement && <div className="message-bubble bot-msg"><i>{t('chatbot.ui.loading')}</i></div>}
                    </div>

                    <form className="chatbot-input-area" onSubmit={envoyerMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chatbot.ui.placeholder')}
                        />
                        <button type="submit" disabled={chargement || !input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

export default Chatbot;