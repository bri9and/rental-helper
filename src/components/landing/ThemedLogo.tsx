"use client";

import Image from "next/image";

interface ThemedLogoProps {
  size: number;
  className?: string;
}

export function ThemedLogo({ size, className = "" }: ThemedLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Rental Helper"
      width={size}
      height={size}
      className={className}
    />
  );
}
