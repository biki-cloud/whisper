"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { Home, MessageCircle, PenSquare } from "lucide-react";

const navigation = [
  { name: "ホーム", href: "/", icon: Home },
  { name: "投稿一覧", href: "/posts", icon: MessageCircle },
  { name: "新規投稿", href: "/post/new", icon: PenSquare },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-background/80 fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-lg md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="hidden md:flex md:items-center md:gap-2">
            <Link
              href="/"
              className="text-primary text-xl font-bold tracking-tight"
            >
              Vent
            </Link>
          </div>
          <div className="flex w-full items-center justify-around md:w-auto md:justify-end md:gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex flex-col items-center gap-1 p-3 md:flex-row",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bubble"
                      className="bg-muted absolute inset-0 z-[-1] rounded-lg"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium md:text-sm">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
