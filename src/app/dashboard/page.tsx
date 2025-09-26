import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardClient />
      </main>
      <Footer />
    </div>
  );
}
