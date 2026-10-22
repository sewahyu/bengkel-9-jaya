import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background"
      data-ocid="app.shell"
    >
      <Header />
      <main className="flex-1" data-ocid="app.main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
