import React from "react";
import { ActionItem } from "../view-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "@/providers/i18n-provider";
import { AlertCircle, CreditCard, FileSignature, AlertOctagon } from "lucide-react";
import Link from "next/link";

interface ActionRequiredProps {
  items: ActionItem[];
}

export function ActionRequired({ items }: ActionRequiredProps) {
  const { t } = useTranslation();

  const getIcon = (type: ActionItem["type"]) => {
    switch (type) {
      case "pay_invoice":
        return <CreditCard className="h-4 w-4 text-rose-500" />;
      case "sign_contract":
        return <FileSignature className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertOctagon className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
          {t("common:overview_actions_required")}
          {items.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
              {items.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="text-muted-foreground text-xs font-semibold">{t("common:overview_no_actions")}</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-muted/40 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {t(`common:${item.titleKey}`)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{item.referenceId}</p>
                  </div>
                </div>
                <Link href={item.route} passHref legacyBehavior>
                  <Button size="sm" className="h-8 text-xs font-semibold shrink-0 cursor-pointer">
                    {t("common:view")}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
