import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold font-headline", className)}>
      <div className="bg-primary p-2 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground"
        >
          <path d="M9.879 7.519c.755-1.141 2.316-1.64 3.638-1.158 1.323.482 2.09 1.964 1.585 3.287-.504 1.322-1.99 2.075-3.287 1.585-1.297-.49-2.09-1.989-1.585-3.287z" />
          <path d="M12 15.5v1" />
          <circle cx="12" cy="12" r="10" />
          <path d="M12 19.5v-3" />
        </svg>
      </div>
      <span className="text-xl">Q&A Hub</span>
    </div>
  );
}
