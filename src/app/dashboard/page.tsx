'use client';

import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { useUser } from "@/firebase/auth/use-user";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { NotesSection } from "@/components/dashboard/notes-section";
import { UserSettings } from "@/components/dashboard/user-settings";

function DashboardSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Skeleton className="h-9 w-72 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    <Card className="p-4 flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-grow space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-10 w-10" />
                    </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-72" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function DashboardPage() {
  const { user: firebaseUser, loading: loadingAuth } = useUser();
  
  if (loadingAuth) {
    return <DashboardSkeleton />;
  }

  if (!firebaseUser) {
    return redirect("/login");
  }

  // Fetch appUser only after confirming firebaseUser exists
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: appUser, loading: loadingUser } = useDoc<User>(`users/${firebaseUser.uid}`);

  if (loadingUser) {
     return <DashboardSkeleton />;
  }
  
  if (!appUser) {
    return (
       <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading User Profile</AlertTitle>
            <AlertDescription>
              We couldn't find your user profile data in the database. This might be due to a sign-up issue. Please try logging out and signing up again.
            </AlertDescription>
          </Alert>
       </div>
    )
  }

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${appUser.username}`;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
            <p className="text-muted-foreground">Here are all the questions you've received.</p>
          </div>
          <Card className="p-4 flex items-center gap-4">
             <div className="flex-grow">
                 <p className="text-sm font-semibold">Your public link:</p>
                 <Link href={profileUrl} className="text-sm text-primary hover:underline break-all">
                    {profileUrl}
                 </Link>
             </div>
             <CopyButton textToCopy={profileUrl} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DashboardClient user={appUser} />
          </div>
          <div className="space-y-8">
            <UserSettings user={appUser} />
            <NotesSection user={appUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
