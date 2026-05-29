import React from 'react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/CGV.css';

function CGV() {
  const { t } = useTranslation();

  return (
    <div className="cgv-page">
      <div className="cgv-container">
        <h1>{t('cgv.title')}</h1>
        <p className="subtitle">{t('cgv.subtitle')}</p>

        <section className="cgv-section">
          <h2>{t('cgv.art1_title')}</h2>
          <p>{t('cgv.art1_p1')}</p>
          <p>
            <strong>{t('cgv.company_name')}</strong><br />
            {t('cgv.company_form')}<br />
            {t('cgv.company_address')}<br />
            {t('cgv.company_rcs')}<br />
            {t('cgv.company_tva')}<br />
            {t('cgv.company_email')}
          </p>
          <p>{t('cgv.art1_p2')}</p>
          <p>{t('cgv.art1_p3')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art2_title')}</h2>
          <p>{t('cgv.art2_p1')}</p>
          <ul>
            <li>{t('cgv.art2_li1')}</li>
            <li>{t('cgv.art2_li2')}</li>
          </ul>
          <p>{t('cgv.art2_p2')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art3_title')}</h2>
          <p>{t('cgv.art3_p1')}</p>
          <ul>
            <li>{t('cgv.art3_li1')}</li>
            <li>{t('cgv.art3_li2')}</li>
            <li>{t('cgv.art3_li3')}</li>
            <li>{t('cgv.art3_li4')}</li>
            <li>{t('cgv.art3_li5')}</li>
          </ul>
          <p>{t('cgv.art3_p2')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art4_title')}</h2>
          <p>{t('cgv.art4_p1')}</p>
          <ul>
            <li>{t('cgv.art4_li1')}</li>
            <li>{t('cgv.art4_li2')}</li>
            <li>{t('cgv.art4_li3')}</li>
            <li>{t('cgv.art4_li4')}</li>
          </ul>
          <p>{t('cgv.art4_p2')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art5_title')}</h2>
          <p>{t('cgv.art5_p1')}</p>
          <p>{t('cgv.art5_p2')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art6_title')}</h2>
          <p>{t('cgv.art6_p1')}</p>
          <p>{t('cgv.art6_p2')}</p>
          <ul>
            <li>{t('cgv.art6_li1')}</li>
            <li>{t('cgv.art6_li2')}</li>
          </ul>
          <p>{t('cgv.art6_p3')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art7_title')}</h2>
          <h3>{t('cgv.art7_1_title')}</h3>
          <p>{t('cgv.art7_1_p1')}</p>
          <p>{t('cgv.art7_1_p2')}</p>

          <h3>{t('cgv.art7_2_title')}</h3>
          <p>{t('cgv.art7_2_p1')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art8_title')}</h2>
          <p>{t('cgv.art8_p1')}</p>

          <h3>{t('cgv.art8_phys_title')}</h3>
          <p>{t('cgv.art8_phys_p1')}</p>

          <h3>{t('cgv.art8_num_title')}</h3>
          <p>{t('cgv.art8_num_p1')}</p>
          <ul>
            <li>{t('cgv.art8_num_li1')}</li>
            <li>{t('cgv.art8_num_li2')}</li>
          </ul>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art9_title')}</h2>
          <h3>{t('cgv.art9_1_title')}</h3>
          <p>{t('cgv.art9_1_p1')}</p>

          <h3>{t('cgv.art9_2_title')}</h3>
          <p>{t('cgv.art9_2_p1')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art10_title')}</h2>
          <p>{t('cgv.art10_p1')}</p>
          <ul>
            <li>{t('cgv.art10_li1')}</li>
            <li>{t('cgv.art10_li2')}</li>
            <li>{t('cgv.art10_li3')}</li>
          </ul>
          <p>{t('cgv.art10_p2')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art11_title')}</h2>
          <p>{t('cgv.art11_p1')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art12_title')}</h2>
          <p>{t('cgv.art12_p1')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art13_title')}</h2>
          <p>{t('cgv.art13_p1')}</p>
          <ul>
            <li>{t('cgv.art13_li1')}</li>
            <li>{t('cgv.art13_li2')}</li>
            <li>{t('cgv.art13_li3')}</li>
          </ul>
          <p>{t('cgv.art13_p2')}</p>
        </section>

        <section className="cgv-section">
          <h2>{t('cgv.art14_title')}</h2>
          <p>{t('cgv.art14_p1')}</p>
          <p>{t('cgv.art14_p2')}</p>
        </section>
      </div>
    </div>
  );
}

export default CGV;