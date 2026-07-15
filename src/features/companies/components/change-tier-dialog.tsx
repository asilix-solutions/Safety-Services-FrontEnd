"use client";

import React, { useState, useEffect } from "react";
import { Company, SubscriptionTier, TIER_LIMITS } from "@/domains/organization/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/select";
import { Layers, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/providers/i18n-provider";
import { getTierLabelKey } from "../helpers/helpers";

const TIERS: SubscriptionTier[] = ["Trial", "Basic", "Professional"];

interface ChangeTierDialogProps {
  company: Company | null;
  onConfirm: (id: string, tier: SubscriptionTier) => { success: boolean; error?: string };
  onClose: () => void;
}

export function ChangeTierDialog({ company, onConfirm, onClose }: ChangeTierDialogProps) {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("Trial");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setSelectedTier(company.tier);
      setError(null);
    }
  }, [company]);

  if (!company) return null;

  const limits = TIER_LIMITS[selectedTier];

  const handleConfirm = () => {
    const result = onConfirm(company.id, selectedTier);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || t("common:companies.dialog.change_tier_error"));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Layers className="h-4 w-4 text-primary" />
            {t("common:companies.dialog.change_tier_title")}
          </DialogTitle>
          <DialogDescription>{company.name}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">
              {t("common:companies.dialog.select_tier_label")}
            </label>
            <Select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as SubscriptionTier)}
            >
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {t(getTierLabelKey(tier))}
                </option>
              ))}
            </Select>
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/20 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("common:companies.table.projects")}</span>
              <span className="font-semibold text-foreground">
                {Number.isFinite(limits.maxProjects) ? limits.maxProjects : t("common:companies.limit_unlimited")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("common:companies.table.personnel")}</span>
              <span className="font-semibold text-foreground">
                {Number.isFinite(limits.maxPersonnel) ? limits.maxPersonnel : t("common:companies.limit_unlimited")}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={onClose}>
              {t("common:companies.dialog.cancel_btn")}
            </Button>
            <Button size="sm" className="flex-1 h-9 text-xs" onClick={handleConfirm}>
              {t("common:companies.dialog.confirm_btn")}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
