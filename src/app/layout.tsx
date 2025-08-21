// src/app/layout.tsx
import './globals.css';
import React from 'react';
import PWARegister from '../components/PWARegister';

export const metadata = {
  title: 'FreshFront',
  description: 'FreshFront - AI-Powered Creator Tools',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Viewport for proper sizing and to avoid URL bar flicker */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
        />
        {/* PWA: manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* PWA: splash/background colors */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="background-color" content="#000000" />

        {/* PWA: iOS support for standalone/fullscreen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FreshFront" />

        {/* PWA: Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="FreshFront" />

        {/* Icons (same-origin) */}
        <link rel="icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        {/* Register service worker for PWA */}
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
