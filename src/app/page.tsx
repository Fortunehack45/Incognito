import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-foreground">
            Welcome to Incognito
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
            Get anonymous feedback, questions, and compliments from your friends and followers.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
