import '../styles/globals.css';

export const metadata = {
  title: 'Isometric Climate Garden',
  description: 'Interactive garden simulation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
