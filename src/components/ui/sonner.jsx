"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner"; // Sonner version is not specified in JS import

const Toaster = ({ ...props }) => {
  // Menghapus tipe ToasterProps
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      // Menghapus type assertion theme as ToasterProps["theme"]
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        }
      }
      {...props}
    />
  );
};

export { Toaster };