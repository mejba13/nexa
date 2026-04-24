import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { JetBrains_Mono } from 'next/font/google';

import { Providers } from './providers';

import './globals.css';

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nexa — One platform. Infinite intelligence.',
    template: '%s · Nexa',
  },
  description:
    'A multi-agent AI platform powered by Claude. Four specialized autonomous agents in one workspace.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Nexa',
    description: 'One platform. Infinite intelligence.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#FF9100',
          colorBackground: '#000000',
          colorText: '#F5F5F5',
          colorInputBackground: '#0A0A0A',
          colorInputText: '#F5F5F5',
          colorNeutral: '#F5F5F5',
          borderRadius: '0.75rem',
          fontFamily: '"Google Sans Text", system-ui, sans-serif',
        },
      }}
    >
      <html lang="en" className={`dark ${jetbrains.variable}`} suppressHydrationWarning>
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Google+Sans+Display:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&display=swap"
          />
        </head>
        <body className="bg-brand-bg text-brand-text font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
