import { useContent } from '../context/ContentContext';

const CmsContent = ({ identifier, tag: Tag = 'div', className = '' }) => {
    const { contents, loading } = useContent();

    if (loading) return null;

    const item = contents[identifier];
    if (!item) return null;

    // Si c'est une image
    if (item.type === 'image' && item.image) {
        return <img src={item.image} alt={identifier} className={className} />;
    }

    // Si c'est du texte
    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: item.text }}
        />
    );
};

export default CmsContent;