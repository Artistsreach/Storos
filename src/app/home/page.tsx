"use client";

import React from "react";
import Desktop from "@/pages/MacOS/Desktop";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function HomeDesktopPage() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}
