import * as z from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(2, { message: "validation:tooShort" }),
  contactName: z.string().min(2, { message: "validation:tooShort" }),
  contactEmail: z.string().email({ message: "validation:invalidEmail" }),
  contactPhone: z.string().min(8, { message: "validation:required" }),
  status: z.enum(["Lead", "Active", "Inactive", "Prospect"], {
    message: "validation:required",
  }),
  industry: z.string().min(2, { message: "validation:required" }),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const createCustomerSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: "اسم المنشأة مطلوب (حرفين على الأقل)" }),
  commercialRegistration: z
    .string()
    .refine((val) => /^\d{10}$/.test(val.trim()), {
      message: "رقم السجل التجاري يجب أن يتكون من 10 أرقام دقيقة",
    }),
  industry: z
    .string()
    .min(2, { message: "يرجى تحديد أو إدخال القطاع" }),
  city: z
    .string()
    .min(2, { message: "يرجى تحديد أو إدخال المدينة" }),
  primaryContactName: z
    .string()
    .min(2, { message: "اسم المسؤول الرئيسي مطلوب" }),
  primaryContactEmail: z
    .string()
    .email({ message: "صيغة البريد الإلكتروني غير صالحة" }),
  primaryContactPhone: z
    .string()
    .refine((val) => {
      const clean = val.replace(/[\s-]/g, "");
      return /^(?:\+?966|00966|0)?5\d{8}$/.test(clean);
    }, {
      message: "رقم الجوال يجب أن يبدأ بـ 05 أو 966+ متبوعاً بـ 8 أرقام (+966 5X)",
    }),
  address: z.string().optional(),
});

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;

