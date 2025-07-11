// src/app/page.tsx
"use client";

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Spline Scene Added</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The Spline scene is available on a new page.
        </p>
        <Button asChild>
          <a href="/frontst">View Spline Scene</a>
        </Button>
      </div>
    </div>
  );
}
