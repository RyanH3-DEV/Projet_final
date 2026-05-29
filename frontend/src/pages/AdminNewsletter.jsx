import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Calendar, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../style_localisés/AdminNewsletter.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function AdminNewsletter() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledAt, setScheduledAt] = useState('');

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!subject || !content) {
      setFeedback({ type: 'error', text: t('admin_newsletter.error_missing_fields') });
      return;
    }

    if (status === 'scheduled' && !scheduledAt) {
      setFeedback({ type: 'error', text: t('admin_newsletter.error_missing_date') });
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      setFeedback({ type: 'error', text: t('admin_newsletter.error_unauthorized') });
      setLoading(false);
      return;
    }

    let formattedDate = null;
    if (status === 'scheduled' && scheduledAt) {
      formattedDate = new Date(scheduledAt).toISOString();
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admin/newsletter/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          content,
          status,
          scheduledAt: formattedDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', text: t('admin_newsletter.success_campaign_saved') });
        if (status === 'scheduled') {
            setSubject('');
            setContent('');
        }
      } else {
        setFeedback({ type: 'error', text: data.error || t('admin_newsletter.error_saving') });
      }
    } catch (error) {
      setFeedback({ type: 'error', text: t('admin_newsletter.error_server_unreachable') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-newsletter-container">
      <div className="admin-header">
        <h2><Mail size={28} /> {t('admin_newsletter.title')}</h2>
        <p>{t('admin_newsletter.subtitle')}</p>
      </div>

      {feedback && (
        <div className={`feedback-box ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('admin_newsletter.label_subject')}</label>
          <input
            type="text"
            className="form-control"
            placeholder={t('admin_newsletter.placeholder_subject')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t('admin_newsletter.label_content')}</label>
          <textarea
            className="form-control"
            placeholder={t('admin_newsletter.placeholder_content')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="status-selector">
          <label className="status-option">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
            />
            {t('admin_newsletter.status_draft')}
          </label>
          <label className="status-option">
            <input
              type="radio"
              name="status"
              value="scheduled"
              checked={status === 'scheduled'}
              onChange={() => setStatus('scheduled')}
            />
            {t('admin_newsletter.status_scheduled')}
          </label>
        </div>

        {status === 'scheduled' && (
          <div className="form-group">
            <label>{t('admin_newsletter.label_date')}</label>
            <input
              type="datetime-local"
              className="form-control"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? t('admin_newsletter.btn_loading') : (
            status === 'draft' ? <><Save size={20} /> {t('admin_newsletter.btn_save_draft')}</> : <><Calendar size={20} /> {t('admin_newsletter.btn_schedule')}</>
          )}
        </button>
      </form>
    </div>
  );
}

export default AdminNewsletter;