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
          <meta name="apple-mobile-web-app-title" content="FreshFront" />

          {/* Android: enable standalone */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="application-name" content="FreshFront" />

          {/* Theme colors */}
          <meta name="theme-color" content="#0ea5e9" />
          <meta name="background-color" content="#0b1220" />

          {/* Icons (add these PNGs under public/icons/) */}
          <link rel="icon" sizes="512x512" href="https://inrveiaulksfmzsbyzqj.supabase.co/storage/v1/object/public/images/512.png" />
          <link rel="apple-touch-icon" href="https://inrveiaulksfmzsbyzqj.supabase.co/storage/v1/object/public/images/180.png" />

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
