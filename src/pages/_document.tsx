import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA manifest */}
          <link rel="manifest" href="/manifest.webmanifest" />

          {/* Viewport and display for iOS fullscreen */}
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />

          {/* iOS: enable standalone/fullscreen */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Storos" />

          {/* Android: enable standalone */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="application-name" content="Storos" />

          {/* Theme colors */}
          <meta name="theme-color" content="#0ea5e9" />
          <meta name="background-color" content="#0b1220" />

          {/* Icons (add these PNGs under public/icons/) */}
          <link rel="icon" href="/icons/icon-192.png" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

          {/* Misc */}
          <meta name="format-detection" content="telephone=no" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
