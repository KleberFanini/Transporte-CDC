import "./globals.css";
import Sidebar from "@/components/Sidebar/sidebar";
import Topbar from "@/components/Topbar/topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`antialiased`}
      >
        <Sidebar />
        <Topbar />

        {children}
      </body>
    </html>
  );
}
