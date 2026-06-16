import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Emeklilik Hesaplayıcı | SGK Emeklilik Aylığı',
  description: 'MÜKTEZA tabanlı Turkish SGK emeklilik aylığı bağlama koşulları hesaplayıcısı. 506 SK, 5510 SK, 2926 SK, Maden emekliliği ve daha fazlası.',
  keywords: ['emeklilik', 'SGK', 'hesaplayıcı', 'MÜKTEZA', '506 SK', '5510 SK'],
  authors: [{ name: 'DURDU', url: 'https://github.com/drdkyn' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  openGraph: {
    title: 'Emeklilik Hesaplayıcı',
    description: 'SGK emeklilik aylığı koşulları hesaplayıcısı',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen">
          {children}
        </div>
        <footer className="bg-gray-900 text-gray-300 text-center py-4 text-sm mt-12">
          <p>© 2026 Emeklilik Hesaplayıcı • Kaynak: MÜKTEZA_01_02_2023.xlsb</p>
          <p className="text-gray-500 text-xs mt-2">Bilgilendirme amaçlıdır. SGK kayıtları resmidir.</p>
        </footer>
      </body>
    </html>
  );
}
