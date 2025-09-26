'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublicLinkProps {
  username: string | undefined;
}

export function PublicLink({ username }: PublicLinkProps) {
  const [publicLink, setPublicLink] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (username && typeof window !== 'undefined') {
      const url = `${window.location.origin}/u/${username}`;
      setPublicLink(url);
    }
  }, [username]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    toast({
      title: 'Copied to clipboard!',
      description: 'You can now share your public link.',
    });
  };

  if (!username) {
    return null;
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Your public link</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input value={publicLink} readOnly className="text-base text-primary font-mono" />
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
