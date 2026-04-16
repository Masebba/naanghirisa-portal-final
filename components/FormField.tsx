import React from 'react';

export const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  helpText?: string;
}> = ({ label, children, helpText }) => (
  <label className="form-field">
    <span>{label}</span>
    {children}
    {helpText ? <small>{helpText}</small> : null}
  </label>
);