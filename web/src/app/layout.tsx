import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Reading Notes | Yuta Takasu',
  description: 'My reading highlights and notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <main className="max-w-2xl mx-auto px-6 py-16">
            {children}
          </main>
          <footer className="footer">
            <a href="https://yutamc.com" className="hover:text-[#1A1A1A]">
              yutamc.com
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
