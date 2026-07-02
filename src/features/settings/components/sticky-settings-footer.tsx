import React from "react";
import { Button } from "@/shared/ui/button";

interface StickySettingsFooterProps {
  isDirty: boolean;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  isEditable: boolean;
  t: (key: string) => string;
}

export function StickySettingsFooter({
  isDirty,
  onSave,
  onCancel,
  onReset,
  isEditable,
  t
}: StickySettingsFooterProps) {
  if (!isEditable) return null;

  return (
    <div className="sticky bottom-0 z-40 w-full bg-card/80 backdrop-blur border-t border-border p-4 flex items-center justify-between rounded-xl shadow-lg mt-6">
      <div>
        <Button
          variant="outline"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {t("settings:btnReset") || "Reset Section"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={!isDirty}
          className="text-xs cursor-pointer"
        >
          {t("settings:btnCancel") || "Cancel Changes"}
        </Button>
        
        <Button
          variant="default"
          onClick={onSave}
          disabled={!isDirty}
          className="text-xs font-semibold bg-primary text-white hover:bg-primary/90 shadow cursor-pointer px-4"
        >
          {t("settings:btnSave") || "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
export default StickySettingsFooter;
