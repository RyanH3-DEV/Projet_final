import { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ nom: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Je remplace la logique PHP par un appel API vers mon backend Symfony
    try {
      await axios.post('https://api.tonprojet.com/contact', formData);
      alert("Message envoyé !");
    } catch (error) {
      console.error("Erreur d'envoi", error);
    }
  };

  return (
    <div className="contact-container">
      <h2>Contactez-nous</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom"
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <textarea
          placeholder="Message"
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
        />
        <button type="submit"><Send size={18} /> Envoyer</button>
      </form>
    </div>
  );
}