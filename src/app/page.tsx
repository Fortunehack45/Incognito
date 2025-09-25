import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-questions");
  const user = await getAuthenticatedUser();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
            Where Curiosity Connects.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Create a profile, share your link, and let the anonymous questions roll in. Uncover what people are dying to know.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <Button asChild size="lg" className="text-lg">
                <Link href="/dashboard">Go to Your Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg">
                  <Link href="/signup">Get Your Link</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="text-lg">
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle>Example Question</CardTitle>
              <CardDescription>This is how questions will appear on your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              {heroImage && (
                <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                  />
                </div>
              )}
              <div className="space-y-4">
                  <p className="font-semibold text-muted-foreground">Anonymous asked:</p>
                  <p className="text-lg font-medium">"If you could have any superpower, what would it be and why?"</p>
                  <p className="font-semibold text-primary">Your Answer:</p>
                  <p className="border-l-2 border-primary pl-4 text-muted-foreground">"I'd choose teleportation! I could visit any place in the world in an instant, see new cultures, and never have to deal with traffic again."</p>
              </div>
            </CardContent>
             <CardFooter>
              <p className="text-xs text-muted-foreground">Answered just now</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
