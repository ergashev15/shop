import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Robiya Shop — butun oila uchun kiyimlar',
  description: 'Robiya Shop — butun oila uchun zamonaviy va didli kiyimlar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
