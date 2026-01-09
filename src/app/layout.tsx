// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Equippe Pedidos",
  description: "Sistema de Compras e Aprovações",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}