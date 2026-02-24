import "./globals.css";
import Sidebar from "@/components/Sidebar/sidebar";

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
        <Sidebar />

        {children}
      </body>
    </html>
  );
}
