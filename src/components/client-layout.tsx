"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseProvider } from "@/firebase/provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";

function AppSkeleton() {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="bg-card border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 flex items-center justify-between h-16">
                   <Skeleton className="h-8 w-28" />
                   <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                   </div>
                </div>
            </header>
             <main className="flex-grow container mx-auto px-4 py-8">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-8 w-3/4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-12 w-24" />
                    </div>
                </div>
            </main>
        </div>
    )
}


export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <AppSkeleton />;
  }

  return (
    <ThemeProvider>
      <FirebaseProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
        </div>
        <Toaster />
      </FirebaseProvider>
    </ThemeProvider>
  );
}
