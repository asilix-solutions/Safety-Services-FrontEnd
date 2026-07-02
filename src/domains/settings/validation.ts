import {
  CompanyProfileSettings,
  BrandingSettings,
  WorkspacePreferenceSettings,
  DomainNotificationSettings,
  SecuritySettings
} from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateCompany(profile: CompanyProfileSettings): ValidationResult {
  const errors: Record<string, string> = {};

  if (!profile.companyName.trim()) {
    errors.companyName = "validation_companyName_required";
  }
  if (!profile.companyShortName.trim()) {
    errors.companyShortName = "validation_companyShortName_required";
  }
  if (!profile.commercialRegistration.trim()) {
    errors.commercialRegistration = "validation_commercialRegistration_required";
  }
  if (!profile.taxNumber.trim()) {
    errors.taxNumber = "validation_taxNumber_required";
  }
  if (!profile.phone.trim()) {
    errors.phone = "validation_phone_required";
  }
  if (!profile.email.trim()) {
    errors.email = "validation_email_required";
  } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
    errors.email = "validation_email_invalid";
  }

  if (profile.supportEmail && !/\S+@\S+\.\S+/.test(profile.supportEmail)) {
    errors.supportEmail = "validation_supportEmail_invalid";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateBranding(branding: BrandingSettings): ValidationResult {
  const errors: Record<string, string> = {};

  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const hslPattern = /^hsl\(\d+,\s*\d+%\s*,\s*\d+%\)$/;

  if (!branding.primaryColor.trim()) {
    errors.primaryColor = "validation_primaryColor_required";
  } else if (!hexPattern.test(branding.primaryColor) && !hslPattern.test(branding.primaryColor)) {
    errors.primaryColor = "validation_primaryColor_invalid";
  }

  if (!branding.secondaryColor.trim()) {
    errors.secondaryColor = "validation_secondaryColor_required";
  } else if (!hexPattern.test(branding.secondaryColor) && !hslPattern.test(branding.secondaryColor)) {
    errors.secondaryColor = "validation_secondaryColor_invalid";
  }

  if (!branding.accentColor.trim()) {
    errors.accentColor = "validation_accentColor_required";
  } else if (!hexPattern.test(branding.accentColor) && !hslPattern.test(branding.accentColor)) {
    errors.accentColor = "validation_accentColor_invalid";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validatePreferences(preferences: WorkspacePreferenceSettings): ValidationResult {
  const errors: Record<string, string> = {};

  if (!preferences.timezone.trim()) {
    errors.timezone = "validation_timezone_required";
  }
  if (!preferences.dateFormat.trim()) {
    errors.dateFormat = "validation_dateFormat_required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateNotifications(notifications: DomainNotificationSettings): ValidationResult {
  // Checkboxes are boolean and always valid
  return {
    valid: true,
    errors: {}
  };
}

export function validateSecurity(security: SecuritySettings): ValidationResult {
  const errors: Record<string, string> = {};

  if (security.sessionTimeoutMinutes <= 0 || isNaN(security.sessionTimeoutMinutes)) {
    errors.sessionTimeoutMinutes = "validation_sessionTimeout_invalid";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
