import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-foreground rounded-md">
        <ShieldCheck className="h-6 w-6 text-background" />
      </div>
      <span className="font-headline text-xl font-bold text-foreground">
        Incognito
      </span>
    </div>
  );
}
