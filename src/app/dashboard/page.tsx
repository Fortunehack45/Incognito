'use client';

import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { useUser } from "@/firebase/auth/use-user";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

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
                <div>
                  <Skeleton className="h-10 w-full mb-2" />
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
            </div>
        </div>
    )
}


export default function DashboardPage() {
  const { user: firebaseUser, loading: loadingAuth } = useUser();
  const { data: appUser, loading: loadingUser } = useDoc<User>(firebaseUser ? `users/${firebaseUser.uid}` : '');
  
  if (loadingAuth || loadingUser) {
    return <DashboardSkeleton />;
  }

  if (!firebaseUser) {
    redirect("/login");
  }
  
  if (!appUser) {
    // This case might happen briefly or if there's a data consistency issue
    return <DashboardSkeleton />;
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

        <DashboardClient user={appUser} />
      </div>
    </div>
  );
}
