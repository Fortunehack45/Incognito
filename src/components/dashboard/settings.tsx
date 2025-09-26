'use client';

import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldQuestion } from 'lucide-react';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  user: User | null;
}

export function Settings({ user }: SettingsProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleModerationToggle = async (checked: boolean) => {
    if (!user) return;
    try {
      const userRef = doc(firestore, 'users', user.id);
      await updateDoc(userRef, {
        isModerationEnabled: checked,
      });
      toast({
        title: 'Settings updated',
        description: `AI Question Moderation is now ${checked ? 'ON' : 'OFF'}.`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Could not update your settings.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Settings</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 p-4 rounded-md bg-background/50">
            <ShieldQuestion className="h-6 w-6 text-primary" />
            <div className='flex-grow'>
                <Label htmlFor="moderation-switch" className="font-semibold">AI Question Moderation</Label>
                <p className="text-xs text-muted-foreground">Automatically block inappropriate questions.</p>
            </div>
            <Switch
                id="moderation-switch"
                checked={user.isModerationEnabled}
                onCheckedChange={handleModerationToggle}
            />
        </div>
      </CardContent>
    </Card>
  );
}
