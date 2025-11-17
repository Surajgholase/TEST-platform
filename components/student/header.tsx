"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StudentHeader({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Aptitude Test Platform</h1>
        <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
