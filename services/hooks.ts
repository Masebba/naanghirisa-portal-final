import { useEffect, useState } from 'react';
import { PageContent } from '../types';
import { loadPageContent, subscribePageContent } from './contentService';
import { subscribeCollection, type CollectionName } from './firestore';

export function usePageContent() {
  const [content, setContent] = useState<PageContent | null>(null);
  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribePageContent(data => {
      if (mounted) setContent(data);
    });
    loadPageContent().then(data => {
      if (mounted) setContent(data);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  return content;
}

export function useCollection<T>(collection: CollectionName) {
  const [items, setItems] = useState<Array<T & { id: string }>>([]);
  useEffect(() => subscribeCollection<T>(collection as CollectionName, setItems), [collection]);
  return items;
}
