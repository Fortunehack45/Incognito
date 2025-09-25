'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth-actions";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import type { User as FirebaseUser } from "firebase/auth";
import { useDoc } from "@/firebase";
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
  const avatarImage = appUser ? PlaceHolderImages.find(p => p.id === `avatar-${appUser.id}`) : null;

  if (loading || !appUser) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  const fallback = appUser.username.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={appUser.username} />}
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
