import React from 'react';
import Desktop from './MacOS/Desktop';
import { ThemeProvider } from '../contexts/ThemeContext';
import FloatingSwitch from '../components/FloatingSwitch';

export default function MacOSPage() {
  return (
    <ThemeProvider>
      <Desktop />
      <FloatingSwitch />
    </ThemeProvider>
  );
}
