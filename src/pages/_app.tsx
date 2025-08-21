import type { AppProps } from 'next/app';
import '../app/globals.css';
import PWARegister from '../components/PWARegister';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <PWARegister />
      <Component {...pageProps} />
    </>
  );
}
