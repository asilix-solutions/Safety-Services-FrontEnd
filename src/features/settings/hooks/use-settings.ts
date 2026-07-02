import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/i18n-provider";
import {
  CompanyProfileSettings,
  BrandingSettings,
  WorkspacePreferenceSettings,
  DomainNotificationSettings,
  SecuritySettings,
  DerivedOrganizationInfo,
  getCompanyProfile,
  saveCompanyProfile,
  getBranding,
  saveBranding,
  getWorkspacePreferences,
  saveWorkspacePreferences,
  getNotificationSettings,
  saveNotificationSettings,
  getSecuritySettings,
  saveSecuritySettings,
  getOrganizationInformation,
  resetCompanyProfile,
  resetBranding,
  resetWorkspacePreferences,
  resetNotificationSettings,
  resetSecuritySettings,
  validateCompany,
  validateBranding,
  validatePreferences,
  validateNotifications,
  validateSecurity
} from "@/domains/settings";

export type SettingsTab = "company" | "branding" | "preferences" | "notifications" | "security" | "organization";

export function useSettings() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  // Draft States
  const [companyDraft, setCompanyDraft] = useState<CompanyProfileSettings | null>(null);
  const [brandingDraft, setBrandingDraft] = useState<BrandingSettings | null>(null);
  const [prefsDraft, setPrefsDraft] = useState<WorkspacePreferenceSettings | null>(null);
  const [notifsDraft, setNotifsDraft] = useState<DomainNotificationSettings | null>(null);
  const [securityDraft, setSecurityDraft] = useState<SecuritySettings | null>(null);

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Permissions helpers
  const userRole = user?.role || "";
  const isSuperAdmin = userRole === "Super Admin";
  const isCompanyAdmin = userRole === "Company Admin";
  const isOpsOfficer = userRole === "Operations Officer";
  const isEngineer = userRole === "Consulting Engineer";
  const isSales = userRole === "Sales Agent";
  const isClient = userRole === "Client";

  // Tab Permission Matrix
  const tabPermissions = useMemo(() => {
    return {
      company: {
        visible: !isClient,
        editable: isSuperAdmin || isCompanyAdmin
      },
      branding: {
        visible: !isClient && !isSales,
        editable: isSuperAdmin || isCompanyAdmin
      },
      preferences: {
        visible: true,
        editable: true
      },
      notifications: {
        visible: true,
        editable: true
      },
      security: {
        visible: isSuperAdmin || isCompanyAdmin,
        editable: isSuperAdmin || isCompanyAdmin
      },
      organization: {
        visible: isSuperAdmin || isCompanyAdmin || isOpsOfficer || isEngineer,
        editable: false
      }
    };
  }, [isSuperAdmin, isCompanyAdmin, isOpsOfficer, isEngineer, isSales, isClient]);

  // Derived Info
  const orgInfo = useMemo(() => getOrganizationInformation(user), [user]);

  // Initial load
  useEffect(() => {
    setCompanyDraft(getCompanyProfile());
    setBrandingDraft(getBranding());
    setPrefsDraft(getWorkspacePreferences());
    setNotifsDraft(getNotificationSettings());
    setSecurityDraft(getSecuritySettings());

    // Resolve default active tab by permission
    if (isClient) {
      setActiveTab("preferences");
    } else if (isSales) {
      setActiveTab("company");
    }
  }, [user, isClient, isSales]);

  // Active Tab Dirty State Tracker
  const isDirty = useMemo(() => {
    if (!companyDraft || !brandingDraft || !prefsDraft || !notifsDraft || !securityDraft) return false;
    
    if (activeTab === "company") {
      return JSON.stringify(companyDraft) !== JSON.stringify(getCompanyProfile());
    }
    if (activeTab === "branding") {
      return JSON.stringify(brandingDraft) !== JSON.stringify(getBranding());
    }
    if (activeTab === "preferences") {
      return JSON.stringify(prefsDraft) !== JSON.stringify(getWorkspacePreferences());
    }
    if (activeTab === "notifications") {
      return JSON.stringify(notifsDraft) !== JSON.stringify(getNotificationSettings());
    }
    if (activeTab === "security") {
      return JSON.stringify(securityDraft) !== JSON.stringify(getSecuritySettings());
    }
    return false;
  }, [activeTab, companyDraft, brandingDraft, prefsDraft, notifsDraft, securityDraft]);

  // Save current active tab changes
  const handleSaveActiveTab = () => {
    setValidationErrors({});
    setAlertMsg(null);

    if (activeTab === "company" && companyDraft) {
      if (!tabPermissions.company.editable) return;
      const res = validateCompany(companyDraft);
      if (!res.valid) {
        setValidationErrors(res.errors);
        setAlertMsg({ text: t("settings:saveErrorValidation"), type: "error" });
        return;
      }
      saveCompanyProfile(companyDraft);
    } else if (activeTab === "branding" && brandingDraft) {
      if (!tabPermissions.branding.editable) return;
      const res = validateBranding(brandingDraft);
      if (!res.valid) {
        setValidationErrors(res.errors);
        setAlertMsg({ text: t("settings:saveErrorValidation"), type: "error" });
        return;
      }
      saveBranding(brandingDraft);
    } else if (activeTab === "preferences" && prefsDraft) {
      const res = validatePreferences(prefsDraft);
      if (!res.valid) {
        setValidationErrors(res.errors);
        setAlertMsg({ text: t("settings:saveErrorValidation"), type: "error" });
        return;
      }
      saveWorkspacePreferences(prefsDraft);
      
      // Sync theme class
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        if (prefsDraft.theme === "dark") {
          root.classList.add("dark");
        } else if (prefsDraft.theme === "light") {
          root.classList.remove("dark");
        }
      }
    } else if (activeTab === "notifications" && notifsDraft) {
      saveNotificationSettings(notifsDraft);
    } else if (activeTab === "security" && securityDraft) {
      if (!tabPermissions.security.editable) return;
      const res = validateSecurity(securityDraft);
      if (!res.valid) {
        setValidationErrors(res.errors);
        setAlertMsg({ text: t("settings:saveErrorValidation"), type: "error" });
        return;
      }
      saveSecuritySettings(securityDraft);
    }

    setAlertMsg({ text: t("settings:saveSuccess"), type: "success" });
    
    // Reload if preferences were updated to apply language/locale changes cleanly
    if (activeTab === "preferences") {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Reset active section back to defaults
  const handleResetActiveTab = () => {
    setAlertMsg(null);
    setValidationErrors({});

    if (activeTab === "company") {
      setCompanyDraft(resetCompanyProfile());
    } else if (activeTab === "branding") {
      setBrandingDraft(resetBranding());
    } else if (activeTab === "preferences") {
      setPrefsDraft(resetWorkspacePreferences());
    } else if (activeTab === "notifications") {
      setNotifsDraft(resetNotificationSettings());
    } else if (activeTab === "security") {
      setSecurityDraft(resetSecuritySettings());
    }

    setAlertMsg({ text: t("settings:resetSuccess"), type: "success" });
  };

  // Cancel pending edits and reload from DB for active tab only
  const handleCancelChanges = () => {
    setValidationErrors({});
    setAlertMsg(null);

    if (activeTab === "company") {
      setCompanyDraft(getCompanyProfile());
    } else if (activeTab === "branding") {
      setBrandingDraft(getBranding());
    } else if (activeTab === "preferences") {
      setPrefsDraft(getWorkspacePreferences());
    } else if (activeTab === "notifications") {
      setNotifsDraft(getNotificationSettings());
    } else if (activeTab === "security") {
      setSecurityDraft(getSecuritySettings());
    }

    setAlertMsg({ text: t("settings:cancelSuccess"), type: "success" });
  };

  return {
    user,
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
    setAlertMsg,
    validationErrors,
    tabPermissions,
    orgInfo,
    isDirty,
    handleSaveActiveTab,
    handleResetActiveTab,
    handleCancelChanges,
    t
  };
}
export default useSettings;
