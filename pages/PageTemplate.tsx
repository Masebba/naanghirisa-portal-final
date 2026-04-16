import React from 'react';
import { PageCard } from '../components/PageCard';

export const PageTemplate: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
  <PageCard title={title} subtitle={subtitle}>
    {children}
  </PageCard>
);