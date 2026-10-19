import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Google Review System | Smart QR & Multi-language Reviews',
  description: 'AI-powered Google Place review booster for businesses. Generate authentic reviews in Marathi, Hindi, and English using Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
