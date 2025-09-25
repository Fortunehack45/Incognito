import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import type { User } from "@/lib/types";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/u/${user.username}`;


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

        <DashboardClient user={user} />
      </div>
    </div>
  );
}
