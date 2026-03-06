import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'iRede EDU Manager',
  description: 'Sistema avançado de gestão acadêmica',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lexend.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(message, source, lineno, colno, error) {
                console.error('Global Client Error:', message, 'at', source, lineno, colno);
              };
              window.onunhandledrejection = function(event) {
                console.error('Unhandled Promise Rejection:', event.reason);
              };
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
