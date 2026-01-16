"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemedLogoProps {
  size: number;
  className?: string;
}

export function ThemedLogo({ size, className = "" }: ThemedLogoProps) {
  const { theme } = useTheme();

  return (
    <Image
      src={theme === "dark" ? "/logo-dark.png" : "/logo.png"}
      alt="Rental Helper"
      width={size}
      height={size}
      className={className}
    />
  );
}
