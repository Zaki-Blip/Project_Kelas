"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

type FullscreenButtonProps = {
  targetId: string;
};

export function FullscreenButton({ targetId }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement !== null);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      const target = document.getElementById(targetId);

      if (target?.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch {
      // Browsers can reject fullscreen without user activation or permission.
    }
  }, [targetId]);

  return (
    <Button type="button" variant="outline" onClick={toggleFullscreen}>
      {isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
    </Button>
  );
}
