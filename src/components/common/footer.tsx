import React from "react";

export function Footer() {
  return (
    <footer className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-6 text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Incognito. All rights reserved.</p>
        <p>Developed By Fourtuna</p>
      </div>
    </footer>
  );
}
