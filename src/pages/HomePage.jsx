import React from 'react';
import Desktop from './MacOS/Desktop';
import { ThemeProvider } from '../contexts/ThemeContext';
import FloatingSwitch from '../components/FloatingSwitch';
import DesktopTextChatbot from './MacOS/DesktopTextChatbot';

export default function MacOSPage() {
  return (
    <ThemeProvider>
      <Desktop />
      <DesktopTextChatbot />
    </ThemeProvider>
  );
}
