import { Customer } from "./types";

export interface CustomerValidationError {
  companyName?: string;
  commercialRegistration?: string;
  industry?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  city?: string;
  address?: string;
}

export function validateCustomer(customer: Partial<Customer>): {
  valid: boolean;
  errors: CustomerValidationError;
} {
  const errors: CustomerValidationError = {};

  if (!customer.companyName || customer.companyName.trim().length === 0) {
    errors.companyName = "customers.validation.name_required";
  }

  if (!customer.commercialRegistration || customer.commercialRegistration.trim().length === 0) {
    errors.commercialRegistration = "customers.validation.cr_required";
  }

  if (!customer.primaryContactName || customer.primaryContactName.trim().length === 0) {
    errors.primaryContactName = "customers.validation.contact_required";
  }

  if (!customer.primaryContactEmail || customer.primaryContactEmail.trim().length === 0) {
    errors.primaryContactEmail = "customers.validation.email_required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.primaryContactEmail)) {
    errors.primaryContactEmail = "customers.validation.email_invalid";
  }

  if (!customer.primaryContactPhone || customer.primaryContactPhone.trim().length === 0) {
    errors.primaryContactPhone = "customers.validation.phone_required";
  }

  if (!customer.city || customer.city.trim().length === 0) {
    errors.city = "customers.validation.city_required";
  }

  if (!customer.address || customer.address.trim().length === 0) {
    errors.address = "customers.validation.address_required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
