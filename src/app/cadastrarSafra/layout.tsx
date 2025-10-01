'use client';
import React from 'react';
import { SafraWizardProvider } from '@/context/SafraWizardContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SafraWizardProvider>{children}</SafraWizardProvider>;
}
