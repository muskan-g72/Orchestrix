"use client";

import React from "react";

/**
 * FutureCharacterSlot:
 * Reserved mounting slot for future 3D GLB character asset.
 * Per specification: Leave an empty slot component in the hero for a future 3D character GLB; do not build a character.
 */
export function FutureCharacterSlot({ className = "" }: { className?: string }) {
  return (
    <div
      data-testid="future-3d-character-slot"
      className={`pointer-events-none relative transition-all duration-300 ${className}`}
      aria-hidden="true"
    >
      {/* Reserved for future GLB character mount */}
    </div>
  );
}
