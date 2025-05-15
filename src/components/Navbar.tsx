"use client";
import Link from 'next/link';
import { Truck, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const navLinkClasses = (path: string) => 
    cn(
      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      pathname === path 
        ? "bg-primary-foreground/20 text-accent-foreground" 
        : "hover:bg-primary-foreground/10 hover:text-primary-foreground/80"
    );

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:text-accent transition-colors">
          LogiTrack Lite
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/log-delivery" className={navLinkClasses("/log-delivery")}>
            <Truck className="h-5 w-5" />
            <span className="hidden sm:inline">Log Delivery</span>
          </Link>
          <Link href="/" className={navLinkClasses("/")}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
