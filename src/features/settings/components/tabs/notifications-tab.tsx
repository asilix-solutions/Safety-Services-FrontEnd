import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { DomainNotificationSettings, ChannelPreference } from "@/domains/settings/types";

interface NotificationsTabProps {
  draft: DomainNotificationSettings | null;
  setDraft: React.Dispatch<React.SetStateAction<DomainNotificationSettings | null>>;
  isEditable: boolean;
  t: (key: string) => string;
}

export function NotificationsTab({ draft, setDraft, isEditable, t }: NotificationsTabProps) {
  if (!draft) return null;

  const handleChannelChange = (domain: keyof DomainNotificationSettings, channel: keyof ChannelPreference, checked: boolean) => {
    setDraft((prev) => {
      if (!prev) return null;
      const domainVal = prev[domain];
      return {
        ...prev,
        [domain]: {
          ...domainVal,
          [channel]: checked
        }
      };
    });
  };

  const domains: { key: keyof DomainNotificationSettings; label: string }[] = [
    { key: "requests", label: t("settings:domain_requests") || "Requests" },
    { key: "projects", label: t("settings:domain_projects") || "Projects" },
    { key: "siteVisits", label: t("settings:domain_siteVisits") || "Site Visits" },
    { key: "reports", label: t("settings:domain_reports") || "Reports" },
    { key: "certificates", label: t("settings:domain_certificates") || "Certificates" },
    { key: "invoices", label: t("settings:domain_invoices") || "Invoices" }
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("settings:tab_notifications")}</CardTitle>
        <CardDescription>{t("settings:notifications_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((dom) => {
            const val = draft[dom.key];
            return (
              <Card key={dom.key} className="border-border bg-secondary/10 shadow-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold">{dom.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${dom.key}-email`}
                      checked={val.email}
                      onChange={(e) => handleChannelChange(dom.key, "email", e.target.checked)}
                      disabled={!isEditable}
                    />
                    <Label htmlFor={`${dom.key}-email`} className="text-xs font-semibold cursor-pointer">
                      {t("settings:channel_email") || "Email"}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${dom.key}-inApp`}
                      checked={val.inApp}
                      onChange={(e) => handleChannelChange(dom.key, "inApp", e.target.checked)}
                      disabled={!isEditable}
                    />
                    <Label htmlFor={`${dom.key}-inApp`} className="text-xs font-semibold cursor-pointer">
                      {t("settings:channel_inApp") || "In-App"}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
export default NotificationsTab;
