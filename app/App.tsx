"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import WalletConnectionDebug from "@/components/WalletConnectionDebug";

export default function App({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`container-nav mx-auto my-16 flex-1`}>
        {children}
      </main>
      <Footer />
      <WalletConnectionDebug />
    </div>
  );
}
