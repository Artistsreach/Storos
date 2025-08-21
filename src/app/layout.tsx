// src/app/layout.tsx
import './globals.css';
import React from 'react';
import PWARegister from '../components/PWARegister';

export const metadata = {
  title: 'Storos',
  description: 'Storos Progressive Web App',
  themeColor: '#0ea5e9',
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
        <meta name="background-color" content="#0b1220" />

        {/* PWA: iOS support for standalone/fullscreen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Storos" />

        {/* PWA: Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Storos" />

        {/* Icons (ideally PNG 192/512; using existing asset for now) */}
        <link rel="icon" sizes="192x192" href="/icons/icon-192.png" />
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
