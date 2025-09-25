import Link from "next/link";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./theme-switcher";
import { UserProfile } from "./auth/user-profile";
import { getAuthenticatedUser } from "@/lib/auth";

export async function Header() {
  const user = await getAuthenticatedUser();
  
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          {user ? <UserProfile user={user} /> : (
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
