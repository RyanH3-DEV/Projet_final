import React from 'react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/CGU.css';

function CGU() {
  const { t } = useTranslation();

  return (
    <div className="cgu-page">
      <div className="cgu-container">
        <h1>{t('cgu.title')}</h1>

        <section className="cgu-section">
          <h2>{t('cgu.art1_title')}</h2>
          <p>{t('cgu.art1_p1')}</p>
          <p>
            <strong>{t('cgu.company_name')}</strong><br />
            {t('cgu.company_form')}<br />
            {t('cgu.company_address')}<br />
            {t('cgu.company_rcs')}<br />
            {t('cgu.company_email')}
          </p>
          <p>{t('cgu.art1_p2')}</p>
          <p>{t('cgu.art1_p3')}</p>
          <p>
            {t('cgu.host_name')}<br />
            {t('cgu.host_address')}
          </p>
          <p>{t('cgu.art1_p4')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art2_title')}</h2>
          <p>{t('cgu.art2_p1')}</p>
          <ul>
            <li>{t('cgu.art2_li1')}</li>
            <li>{t('cgu.art2_li2')}</li>
            <li>{t('cgu.art2_li3')}</li>
          </ul>
          <p>{t('cgu.art2_p2')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art3_title')}</h2>
          <p>{t('cgu.art3_p1')}</p>
          <p>{t('cgu.art3_p2')}</p>
          <ul>
            <li>{t('cgu.art3_li1')}</li>
            <li>{t('cgu.art3_li2')}</li>
            <li>{t('cgu.art3_li3')}</li>
          </ul>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art4_title')}</h2>
          <p>{t('cgu.art4_p1')}</p>
          <p>{t('cgu.art4_p2')}</p>
          <ul>
            <li>{t('cgu.art4_li1')}</li>
            <li>{t('cgu.art4_li2')}</li>
            <li>{t('cgu.art4_li3')}</li>
          </ul>
          <p>{t('cgu.art4_p3')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art5_title')}</h2>
          <p>{t('cgu.art5_p1')}</p>
          <ul>
            <li>{t('cgu.art5_li1')}</li>
            <li>{t('cgu.art5_li2')}</li>
            <li>{t('cgu.art5_li3')}</li>
            <li>{t('cgu.art5_li4')}</li>
          </ul>
          <p>{t('cgu.art5_p2')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art6_title')}</h2>
          <p>{t('cgu.art6_p1')}</p>
          <p>{t('cgu.art6_p2')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art7_title')}</h2>
          <p>{t('cgu.art7_p1')}</p>
          <ul>
            <li>{t('cgu.art7_li1')}</li>
            <li>{t('cgu.art7_li2')}</li>
            <li>{t('cgu.art7_li3')}</li>
          </ul>
          <p>{t('cgu.art7_p2')}</p>
          <p>{t('cgu.art7_p3')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art8_title')}</h2>
          <p>{t('cgu.art8_p1')}</p>
          <ul>
            <li>{t('cgu.art8_li1')}</li>
            <li>{t('cgu.art8_li2')}</li>
            <li>{t('cgu.art8_li3')}</li>
          </ul>

          <h3>{t('cgu.art8_1_title')}</h3>
          <p>{t('cgu.art8_1_p1')}</p>
          <ul>
            <li>{t('cgu.art8_1_li1')}</li>
            <li>{t('cgu.art8_1_li2')}</li>
            <li>{t('cgu.art8_1_li3')}</li>
            <li>{t('cgu.art8_1_li4')}</li>
          </ul>

          <h3>{t('cgu.art8_2_title')}</h3>
          <p>{t('cgu.art8_2_p1')}</p>
          <ul>
            <li>{t('cgu.art8_2_li1')}</li>
            <li>{t('cgu.art8_2_li2')}</li>
            <li>{t('cgu.art8_2_li3')}</li>
          </ul>
          <p>{t('cgu.art8_2_p2')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art9_title')}</h2>
          <p>{t('cgu.art9_p1')}</p>
          <ul>
            <li>{t('cgu.art9_li1')}</li>
            <li>{t('cgu.art9_li2')}</li>
          </ul>
          <p>{t('cgu.art9_p2')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art10_title')}</h2>
          <p>{t('cgu.art10_p1')}</p>
          <p>{t('cgu.art10_p2')}</p>
          <ul>
            <li>{t('cgu.art10_li1')}</li>
            <li>{t('cgu.art10_li2')}</li>
            <li>{t('cgu.art10_li3')}</li>
          </ul>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art11_title')}</h2>
          <p>{t('cgu.art11_p1')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art12_title')}</h2>
          <p>{t('cgu.art12_p1')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art13_title')}</h2>
          <p>{t('cgu.art13_p1')}</p>
        </section>

        <section className="cgu-section">
          <h2>{t('cgu.art14_title')}</h2>
          <p>{t('cgu.art14_p1')}</p>
          <p>{t('cgu.art14_p2')}</p>
          <ul>
            <li>{t('cgu.art14_li1')}</li>
            <li>{t('cgu.art14_li2')}</li>
          </ul>
          <p>{t('cgu.art14_p3')}</p>
        </section>
      </div>
    </div>
  );
}

export default CGU;