import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'World Economic Cartogram — aydenmorgan.com/map',
  description:
    'Interactive world cartogram — watch countries grow and shrink by GDP, population, billionaires, tech market cap, oil reserves, and military spending.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
