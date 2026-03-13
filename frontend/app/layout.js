import './globals.css';
import MouseGlow from '../components/MouseGlow';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Study Hub – Collaborate & Study Smarter',
  description: 'A collaborative study platform for students. Chat, share course modules, and get AI-powered study help.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body suppressHydrationWarning className="mouse-glow-wrapper">
        <MouseGlow />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
