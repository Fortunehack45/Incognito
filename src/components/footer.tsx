import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          &copy; {new Date().getFullYear()} Incognito. All rights reserved.
        </div>
        <div className="text-sm text-muted-foreground">
          Developed By{' '}
          <a
            href="https://wa.me/2349167689200"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Fourtuna
          </a>
        </div>
      </div>
    </footer>
  );
}
