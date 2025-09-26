'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/types';
import { Bot } from 'lucide-react';

export function UserSettings({ user }: { user: User }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  async function handleModerationToggle(checked: boolean) {
    const userRef = doc(firestore, 'users', user.id);
    try {
      await updateDoc(userRef, { isModerationEnabled: checked });
      toast({
        title: 'Settings updated',
        description: `AI question moderation has been ${checked ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Could not update your settings.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 rounded-md border border-accent p-4">
            <Bot />
            <div className="flex-1 space-y-1">
                <Label htmlFor="moderation-switch" className="text-sm font-medium leading-none">
                 AI Question Moderation
                </Label>
                <p className="text-sm text-muted-foreground">
                Automatically block inappropriate questions.
                </p>
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
