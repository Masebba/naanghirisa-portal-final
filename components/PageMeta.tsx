import React, { useEffect } from 'react';

type PageMetaProps = {
  title: string;
  description: string;
};

export const PageMeta: React.FC<PageMetaProps> = ({ title, description }) => {
  useEffect(() => {
    document.title = title;

    const upsertMeta = (selector: string, attribute: 'name' | 'property', value: string, content: string) => {
      let tag = document.head.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    upsertMeta('description', 'name', 'description', description);
    upsertMeta('og:title', 'property', 'og:title', title);
    upsertMeta('og:description', 'property', 'og:description', description);
  }, [title, description]);

  return null;
};
