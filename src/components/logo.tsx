import { cn } from "@/lib/utils";
import { Spy } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold font-headline", className)}>
      <div className="bg-primary p-2 rounded-lg">
        <Spy className="text-primary-foreground h-6 w-6" />
      </div>
      <span className="text-xl">Incognito</span>
    </div>
  );
}
