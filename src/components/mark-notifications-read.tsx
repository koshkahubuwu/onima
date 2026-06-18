"use client";

import { useEffect } from "react";

export function MarkNotificationsRead() {
  useEffect(() => {
    fetch("/api/notifications", { method: "PATCH" });
  }, []);
  return null;
}
