import "./globals.css";
import { Navbar } from "../component/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Navbar />

        {children}
      </body>
    </html>
  );
}
