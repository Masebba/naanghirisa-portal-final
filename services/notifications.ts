import React from 'react';

type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

const emit = () => {
  listeners.forEach(listener => listener([...toasts]));
};

const scheduleRemoval = (id: string) => {
  window.setTimeout(() => {
    toasts = toasts.filter(item => item.id !== id);
    emit();
  }, 3600);
};

export const notify = (message: string, type: ToastType = 'info', title?: string) => {
  const toast: Toast = {
    id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Something went wrong' : 'Notice'),
    message,
    type,
  };
  toasts = [toast, ...toasts].slice(0, 4);
  emit();
  scheduleRemoval(toast.id);
  return toast.id;
};

export const useToasts = () => {
  const [state, setState] = React.useState<Toast[]>(toasts);

  React.useEffect(() => {
    const listener: Listener = next => setState(next);
    listeners.add(listener);
    setState([...toasts]);
    return () => listeners.delete(listener);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    toasts = toasts.filter(item => item.id !== id);
    emit();
  }, []);

  return { toasts: state, dismiss };
};
