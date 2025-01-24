"use client";

import Link from "next/link";
import { cn } from "~/lib/utils";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Vent
            </Link>
            . All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <nav className="flex gap-4">
            <Link
              href="/terms"
              className={cn(
                "text-sm font-medium underline-offset-4 hover:underline",
                "text-muted-foreground",
              )}
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className={cn(
                "text-sm font-medium underline-offset-4 hover:underline",
                "text-muted-foreground",
              )}
            >
              プライバシーポリシー
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
