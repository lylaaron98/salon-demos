"use client";

import { Button } from "@salon-demos/ui";
import { useEffect, useState } from "react";

/** A button that shows its loading state for two seconds after a click. */
export function LoadingDemo() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 2000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <Button loading={loading} onClick={() => setLoading(true)}>
      {loading ? "Sending" : "Send enquiry"}
    </Button>
  );
}
