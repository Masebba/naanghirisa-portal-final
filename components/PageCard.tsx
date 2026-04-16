import React from 'react';

export const PageCard: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
  <section className="page-card">
    <div className="page-card-head">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
    {children}
  </section>
);