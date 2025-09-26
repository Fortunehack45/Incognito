'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./theme-switcher";
import { UserProfile } from "./auth/user-profile";
import { useUser } from "@/firebase/auth/use-user";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const { user, loading } = useUser();
  
  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : user ? (
            <UserProfile firebaseUser={user} />
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
