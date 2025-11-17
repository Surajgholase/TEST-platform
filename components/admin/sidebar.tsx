"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BarChart3, BookOpen, Building2, FileText, LogOut, Home } from 'lucide-react';


const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/questions", label: "Questions", icon: BookOpen },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/tests", label: "Test Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">Aptitude Test</h1>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Button
        variant="outline"
        className="w-full justify-start text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
