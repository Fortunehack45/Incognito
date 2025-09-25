'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}>
      {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
