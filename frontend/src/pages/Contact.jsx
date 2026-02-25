import React, { useState } from 'react';
import '../style_localisés/Contact.css';

function Contact() {
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
        <h2>🆘 Assistance Client</h2>
        <p>Un problème ? Je suis là pour vous aider.</p>

        {statut === "succes" && <p className="msg-ok">Message envoyé ! Je vous répondrai très vite.</p>}

        <form onSubmit={envoyerAssistance} className="contact-form">
          <input type="text" name="nom" placeholder="Votre nom" required />
          <input type="email" name="email" placeholder="Votre email" required />
          <textarea name="message" placeholder="Décrivez votre problème..." required></textarea>
          <button type="submit">Contacter l'assistance</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;