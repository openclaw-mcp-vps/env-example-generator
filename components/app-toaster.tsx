"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#161b22",
          color: "#f0f6fc",
          border: "1px solid #30363d"
        }
      }}
    />
  );
}
