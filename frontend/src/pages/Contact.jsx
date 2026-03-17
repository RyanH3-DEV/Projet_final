import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Send, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';
import '../style_localisés/Contact.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Contact() {
  const { t } = useTranslation();
  const [statut, setStatut] = useState(null);
  const [chargement, setChargement] = useState(false);

  const envoyerAssistance = async (e) => {
    e.preventDefault();
    setChargement(true);
    setStatut(null);

    const data = Object.fromEntries(new FormData(e.target));

    try {
      const reponse = await fetch(`${BASE_URL}/api/contact-assistance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (reponse.ok) {
        setStatut("succes");
        e.target.reset();
      } else {
        setStatut("erreur");
      }
    } catch (erreur) {
      setStatut("erreur");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <div className="contact-header">
          <ShieldAlert className="contact-icon-cyber" size={40} />
          <h2>{t('contact.title', 'Centre de Réponse Cyna')}</h2>
          <p>{t('contact.subtitle', 'Une anomalie technique ou une question sur vos services ? Mes analystes vous répondent.')}</p>
        </div>

        {statut === "succes" && (
          <div className="msg-ok">
            <CheckCircle size={20} />
            <span>{t('contact.success_msg', 'Ticket ouvert avec succès. Je reviens vers vous dans les plus brefs délais.')}</span>
          </div>
        )}

        {statut === "erreur" && (
          <div className="msg-error">
            <span>{t('contact.error_msg', 'Échec de l\'envoi du ticket. Veuillez vérifier votre connexion.')}</span>
          </div>
        )}

        <form onSubmit={envoyerAssistance} className="contact-form">
          <div className="input-group">
            <input type="text" name="nom" placeholder={t('contact.name_placeholder', 'Nom du collaborateur / Entreprise')} required />
          </div>

          <div className="input-group">
            <input type="email" name="email" placeholder={t('contact.email_placeholder', 'E-mail professionnel')} required />
          </div>

          <div className="input-group">
            <select name="sujet" required className="contact-select">
              <option value="" disabled selected>{t('contact.subject_placeholder', 'Nature de la demande')}</option>
              <option value="technique">{t('contact.sub_tech', 'Support Technique & Déploiement')}</option>
              <option value="facturation">{t('contact.sub_billing', 'Questions de Facturation & Licences')}</option>
              <option value="incident">{t('contact.sub_incident', 'Signalement d\'Incident Cyber')}</option>
              <option value="autre">{t('contact.sub_other', 'Autre demande')}</option>
            </select>
          </div>

          <div className="input-group">
            <textarea name="message" placeholder={t('contact.message_placeholder', 'Précisez les détails de votre demande...')} required></textarea>
          </div>

          <button type="submit" className="btn-contact-submit" disabled={chargement}>
            {chargement ? (
              <><Loader2 className="spinner" size={18} /> {t('contact.sending', 'Transmission...')}</>
            ) : (
              <><Send size={18} /> {t('contact.submit_btn', "Ouvrir un ticket d'assistance")}</>
            )}
          </button>
        </form>

        <div className="contact-footer-info">
          <p>
            <MessageSquare size={14} /> {t('contact.security_note', 'Toutes les communications sont chiffrées de bout en bout.')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;