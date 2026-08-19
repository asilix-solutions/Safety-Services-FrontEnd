"use client";

import React, { useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/shared/ui/dialog";
import { UserRow } from "../view-models/user-list.viewmodel";

interface ActivateDeactivateControlProps {
  row: UserRow;
  canManage: boolean;
  onActivate: (id: string) => Promise<unknown>;
  onDeactivate: (id: string) => Promise<unknown>;
  isBusy: boolean;
}

export function ActivateDeactivateControl({
  row,
  canManage,
  onActivate,
  onDeactivate,
  isBusy,
}: ActivateDeactivateControlProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!canManage) return null;

  const willActivate = row.status === "inactive";

  const handleConfirm = async () => {
    if (willActivate) {
      await onActivate(row.id);
    } else {
      await onDeactivate(row.id);
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        size="sm"
        variant={willActivate ? "outline" : "destructive"}
        onClick={() => setOpen(true)}
      >
        {t(willActivate ? "users:action.activate" : "users:action.deactivate")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(willActivate ? "users:confirm.activate_title" : "users:confirm.deactivate_title")}
            </DialogTitle>
            <DialogDescription>
              {t(willActivate ? "users:confirm.activate_desc" : "users:confirm.deactivate_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {t("users:confirm.cancel")}
            </Button>
            <Button
              size="sm"
              variant={willActivate ? "default" : "destructive"}
              onClick={handleConfirm}
              isLoading={isBusy}
            >
              {t("users:confirm.confirm")}
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
