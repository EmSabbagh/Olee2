import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Ali Sabbagh — A World of Design',
  description:
    'Explore the creative world of Ali Sabbagh. Discover campaigns, reels, and social media across an interactive pixel-art archipelago.',
  metadataBase: new URL('https://ali-sabbagh-world.oleesabbagh.chatgpt.site'),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
