import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
    const { t } = useTranslation();
    const [contents, setContents] = useState({});
    const [loading, setLoading] = useState(true);

    const refreshContent = () => {
        setLoading(true);
        fetch(`${BASE_URL}/api/site-contents`)
            .then(res => res.json())
            .then(data => {
                setContents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(t('content.err_fetch'), err);
                setLoading(false);
            });
    };

    useEffect(() => {
        refreshContent();
    }, []);

    return (
        <ContentContext.Provider value={{ contents, loading, refreshContent }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => useContext(ContentContext);