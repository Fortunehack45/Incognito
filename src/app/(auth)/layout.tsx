import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 rounded-lg">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
