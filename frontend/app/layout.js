import './globals.css';

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
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
