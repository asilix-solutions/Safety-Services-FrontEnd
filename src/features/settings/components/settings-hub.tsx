import React from "react";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";
import { OverviewCards } from "./overview-cards";
import { StickySettingsFooter } from "./sticky-settings-footer";
import { CompanyTab } from "./tabs/company-tab";
import { BrandingTab } from "./tabs/branding-tab";
import { WorkspaceTab } from "./tabs/workspace-tab";
import { NotificationsTab } from "./tabs/notifications-tab";
import { SecurityTab } from "./tabs/security-tab";
import { OrganizationTab } from "./tabs/organization-tab";
import { useSettings, SettingsTab } from "../hooks/use-settings";

export function SettingsHub() {
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const {
    activeTab,
    setActiveTab,
    companyDraft,
    setCompanyDraft,
    brandingDraft,
    setBrandingDraft,
    prefsDraft,
    setPrefsDraft,
    notifsDraft,
    setNotifsDraft,
    securityDraft,
    setSecurityDraft,
    alertMsg,
    validationErrors,
    tabPermissions,
    orgInfo,
    isDirty,
    handleSaveActiveTab,
    handleResetActiveTab,
    handleCancelChanges,
    t
  } = useSettings();

  // Create list of tabs to render based on permissions
  const tabsList: { value: SettingsTab; label: string }[] = [
    { value: "company", label: t("settings:tab_companyProfile") || "Company Profile" },
    { value: "branding", label: t("settings:tab_branding") || "Branding" },
    { value: "preferences", label: t("settings:tab_preferences") || "Workspace Preferences" },
    { value: "notifications", label: t("settings:tab_notifications") || "Notifications" },
    { value: "security", label: t("settings:tab_security") || "Security" },
    { value: "organization", label: t("settings:tab_orgInfo") || "Organization Information" }
  ];

  const visibleTabs = tabsList.filter((tab) => tabPermissions[tab.value].visible);
  const activePermission = tabPermissions[activeTab];

  const handleConfirmReset = () => {
    handleResetActiveTab();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings:title") || "Settings"}
        description={t("settings:subtitle") || "Manage your profile, system settings and notification preferences"}
      />

      {/* Overview stats cards */}
      <OverviewCards
        companyName={companyDraft?.companyName || ""}
        theme={prefsDraft?.theme || "dark"}
        language={prefsDraft?.language || "ar"}
        timeout={securityDraft?.sessionTimeoutMinutes || 30}
        t={t}
      />

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-3 text-xs rounded-xl border ${
            alertMsg.type === "success"
              ? "border-success/20 bg-success/5 text-success"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="space-y-4">
        <div className="bg-muted p-1 rounded-xl flex gap-1 overflow-x-auto w-full md:w-auto">
          {visibleTabs.map((tab) => {
            const labelText = activeTab === tab.value && isDirty 
              ? `${tab.label} *`
              : tab.label;

            return (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.value)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer h-auto"
              >
                {labelText}
              </Button>
            );
          })}
        </div>

        {/* Current Tab Form Container */}
        <div>
          {activeTab === "company" && (
            <CompanyTab
              draft={companyDraft}
              setDraft={setCompanyDraft}
              errors={validationErrors}
              isEditable={activePermission.editable}
              t={t}
            />
          )}

          {activeTab === "branding" && (
            <BrandingTab
              draft={brandingDraft}
              setDraft={setBrandingDraft}
              errors={validationErrors}
              isEditable={activePermission.editable}
              companyShortName={companyDraft?.companyShortName || ""}
              t={t}
            />
          )}

          {activeTab === "preferences" && (
            <WorkspaceTab
              draft={prefsDraft}
              setDraft={setPrefsDraft}
              errors={validationErrors}
              isEditable={activePermission.editable}
              t={t}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              draft={notifsDraft}
              setDraft={setNotifsDraft}
              isEditable={activePermission.editable}
              t={t}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              draft={securityDraft}
              setDraft={setSecurityDraft}
              errors={validationErrors}
              isEditable={activePermission.editable}
              t={t}
            />
          )}

          {activeTab === "organization" && (
            <OrganizationTab
              info={orgInfo}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Sticky Save Footer */}
      <StickySettingsFooter
        isDirty={isDirty}
        onSave={handleSaveActiveTab}
        onCancel={handleCancelChanges}
        onReset={() => setShowResetConfirm(true)}
        isEditable={activePermission.editable}
        t={t}
      />

      {/* Restore Defaults Confirmation Dialog overlay */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              {t("settings:resetConfirmTitle") || "Restore default settings?"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("settings:resetConfirmDesc") || "This action will reset the current tab to default MVP values."}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowResetConfirm(false)}
                className="text-xs cursor-pointer"
              >
                {t("settings:btnCancel") || "Cancel"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReset}
                className="text-xs cursor-pointer bg-destructive text-white hover:bg-destructive/95"
              >
                {t("settings:btnConfirmReset") || "Restore Defaults"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SettingsHub;
