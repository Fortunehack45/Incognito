'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth-actions";
import Link from "next/link";
import type { User as FirebaseUser } from "firebase/auth";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "../ui/skeleton";
import { Timestamp } from "firebase/firestore";

// Define the type directly in the client component to avoid server-only imports
type AppUser = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: Date | Timestamp;
};

export function UserProfile({ firebaseUser }: { firebaseUser: FirebaseUser }) {
  const { data: appUser, loading } = useDoc<AppUser>(`users/${firebaseUser.uid}`);
  const avatarImageUrl = "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwcm9maWxlJTIwcGVyc29ufGVufDB8fHx8MTc1ODgxOTAzNXww&ixlib=rb-4.1.0&q=80&w=1080";

  if (loading || !appUser) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  const fallback = appUser.username.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarImageUrl} alt={appUser.username} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{appUser.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {appUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/u/${appUser.username}`}>Public Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <form action={logout} className="w-full">
          <button type="submit" className="w-full">
            <DropdownMenuItem>
              Log out
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
