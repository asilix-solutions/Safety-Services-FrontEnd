"use client";

import React, { useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface SettlementConfirmProps {
  workerName: string;
  onConfirm: () => Promise<unknown>;
  isSettling: boolean;
}

export function SettlementConfirm({ workerName, onConfirm, isSettling }: SettlementConfirmProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {t("labor:settlement.confirmButton")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
            {t("labor:settlement.dialogTitle")}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <p className="text-sm text-foreground">{t("labor:settlement.warning")}</p>
          <p className="text-sm font-semibold text-foreground">{workerName}</p>
          <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 p-2.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {t("labor:settlement.geoHint")}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isSettling}
            >
              {t("labor:settlement.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={handleConfirm}
              isLoading={isSettling}
            >
              {t("labor:settlement.confirm")}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default SettlementConfirm;
