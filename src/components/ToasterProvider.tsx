"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster position="top-right" richColors expand={false} closeButton />
  );
}
