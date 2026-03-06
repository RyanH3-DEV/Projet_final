import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/Contact.css';

function Contact() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState(null);

  const envoyerAssistance = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    try {
      const reponse = await fetch("http://127.0.0.1:8000/api/contact-assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (reponse.ok) {
        setStatut("succes");
        e.target.reset();
      }
    } catch (erreur) {
      setStatut("erreur");
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <h2>{t('contact.title', '🆘 Assistance Client')}</h2>
        <p>{t('contact.subtitle', 'Un problème ? Je suis là pour vous aider.')}</p>

        {statut === "succes" && <p className="msg-ok">{t('contact.success_msg', 'Message envoyé ! Je vous répondrai très vite.')}</p>}

        <form onSubmit={envoyerAssistance} className="contact-form">
          <input type="text" name="nom" placeholder={t('contact.name_placeholder', 'Votre nom')} required />
          <input type="email" name="email" placeholder={t('contact.email_placeholder', 'Votre email')} required />
          <textarea name="message" placeholder={t('contact.message_placeholder', 'Décrivez votre problème...')} required></textarea>
          <button type="submit">{t('contact.submit_btn', "Contacter l'assistance")}</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;