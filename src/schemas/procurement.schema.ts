import * as z from "zod";

export const procurementSchema = z
  .object({
    supplierName: z.string().trim().min(2, { message: "validation:tooShort" }),
    siloTag: z.enum(["alarm", "suppression", "ventilation"], {
      message: "validation:required",
    }),
    invoiceType: z.enum(["taxable", "non_taxable"], {
      message: "validation:required",
    }),
    preTaxValue: z.coerce
      .number({ message: "validation:required" })
      .positive({ message: "procurement:form.preTaxRequired" }),
    receiptImage: z.string().min(1, { message: "procurement:form.receiptRequired" }),
  })
  .superRefine((values, ctx) => {
    // Taxable invoices must carry a positive pre-tax value the domain applies the isolated
    // 15% ZATCA VAT to; non-taxable invoices reuse the same field as the flat invoice value
    // and never carry a VAT amount — enforced by workflow.ts's computeProcurementVat, not here.
    if (values.invoiceType === "taxable" && values.preTaxValue <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["preTaxValue"],
        message: "procurement:form.preTaxRequired",
      });
    }
  });

export type ProcurementFormValues = z.infer<typeof procurementSchema>;
