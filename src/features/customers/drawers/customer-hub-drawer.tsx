import React, { useState, useEffect } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { Customer } from "@/domains/customers/types";
import { CustomerValidationError } from "@/domains/customers/validation";
import { X, Building, Info, Users, Briefcase, Receipt, FileText } from "lucide-react";
import { getActiveRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getActiveProjects } from "@/domains/projects/storage";
import { getInvoices } from "@/domains/invoices/storage";
import { getContracts } from "@/domains/contracts/storage";
import { getCertificates } from "@/domains/certificates/storage";

interface CustomerHubDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => { success: boolean; errors?: CustomerValidationError };
  permissions: {
    canManageCustomerProfile: boolean;
  };
  initialEditMode?: boolean;
}

export function CustomerHubDrawer({ customer, isOpen, onClose, onSave, permissions, initialEditMode = false }: CustomerHubDrawerProps) {
  const { t } = useTranslation();
  const tenantContext = useTenantContext();
  const [activeTab, setActiveTab] = useState<"overview" | "representatives" | "records" | "invoices" | "documents">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Customer | null>(null);
  const [errors, setErrors] = useState<CustomerValidationError>({});

  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
      setIsEditing(initialEditMode);
      setErrors({});
      setActiveTab("overview");
    }
  }, [customer, initialEditMode, isOpen]);

  if (!isOpen || !customer || !formData) return null;

  const handleSave = () => {
    const res = onSave(formData);
    if (res.success) {
      setIsEditing(false);
      setErrors({});
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  // Linked records aggregation
  const linkedRequests = getActiveRequests(tenantContext, undefined, customer.id);
  const linkedProjects = getActiveProjects(undefined, customer.id);
  const linkedInvoices = getInvoices().filter((i) => i.clientId === customer.id);
  const linkedContracts = getContracts().filter((c) => c.clientId === customer.id);
  const linkedCertificates = getCertificates().filter((c) => c.clientId === customer.id);

  const tabs = [
    { id: "overview", label: t("common:customers.tabs.overview"), icon: Info },
    { id: "representatives", label: t("common:customers.tabs.representatives"), icon: Users },
    { id: "records", label: t("common:customers.tabs.requests_projects"), icon: Briefcase },
    { id: "invoices", label: t("common:customers.tabs.invoices"), icon: Receipt },
    { id: "documents", label: t("common:customers.tabs.documents"), icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="w-full sm:max-w-xl h-full bg-card border-l border-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto relative animate-in slide-in-from-right duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{t("common:customers.details")}</h3>
              {!permissions.canManageCustomerProfile && (
                <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-muted text-muted-foreground border-border">
                  {t("common:read_only")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">{customer.companyName}</p>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/15">
            <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl">
              <Building className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">{customer.companyName}</h4>
              <p className="text-xs text-muted-foreground">{customer.industry}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                  {t(`common:customers.status.${customer.status}`)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-border gap-2 overflow-x-auto pb-1 scrollbar-thin whitespace-nowrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Box */}
          <div className="flex-1 overflow-y-auto py-2 min-h-0 text-xs">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.name")}</label>
                  {isEditing ? (
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground py-1">{customer.companyName}</p>
                  )}
                  {errors.companyName && <p className="text-destructive text-[10px]">{t(`common:${errors.companyName}`)}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.cr")}</label>
                  {isEditing ? (
                    <Input
                      value={formData.commercialRegistration}
                      onChange={(e) => setFormData({ ...formData, commercialRegistration: e.target.value })}
                      className="h-9 text-xs"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground py-1">{customer.commercialRegistration}</p>
                  )}
                  {errors.commercialRegistration && <p className="text-destructive text-[10px]">{t(`common:${errors.commercialRegistration}`)}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.industry")}</label>
                  {isEditing ? (
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="h-9 text-xs"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground py-1">{customer.industry}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:customers.fields.primary_contact")}</label>
                    {isEditing ? (
                      <Input
                        value={formData.primaryContactName}
                        onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                        className="h-9 text-xs"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground py-1">{customer.primaryContactName}</p>
                    )}
                    {errors.primaryContactName && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactName}`)}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:customers.fields.city")}</label>
                    {isEditing ? (
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="h-9 text-xs"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground py-1">{customer.city}</p>
                    )}
                    {errors.city && <p className="text-destructive text-[10px]">{t(`common:${errors.city}`)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:customers.fields.email")}</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.primaryContactEmail}
                        onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                        className="h-9 text-xs"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground py-1">{customer.primaryContactEmail}</p>
                    )}
                    {errors.primaryContactEmail && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactEmail}`)}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">{t("common:customers.fields.phone")}</label>
                    {isEditing ? (
                      <Input
                        value={formData.primaryContactPhone}
                        onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                        className="h-9 text-xs"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground py-1">{customer.primaryContactPhone}</p>
                    )}
                    {errors.primaryContactPhone && <p className="text-destructive text-[10px]">{t(`common:${errors.primaryContactPhone}`)}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">{t("common:customers.fields.address")}</label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-9 text-xs"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground py-1">{customer.address}</p>
                  )}
                  {errors.address && <p className="text-destructive text-[10px]">{t(`common:${errors.address}`)}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-[10px] text-muted-foreground">
                  <div>
                    <span>{t("common:customers.fields.created")}</span>
                    <span className="block font-medium mt-0.5">{new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>{t("common:customers.fields.updated")}</span>
                    <span className="block font-medium mt-0.5">{new Date(customer.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "representatives" && (
              <div className="space-y-3">
                {customer.representatives.map((rep) => (
                  <div key={rep.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-sm">{rep.name}</p>
                      <p className="text-[10px] text-muted-foreground">{rep.role}</p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground">
                      <p>{rep.email}</p>
                      <p>{rep.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "records" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">Active Projects ({linkedProjects.length})</h4>
                  {linkedProjects.length === 0 ? (
                    <p className="text-muted-foreground py-2 text-center border border-dashed border-border rounded-lg">No active projects linked</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedProjects.map((p) => {
                        const phase = p.executionPhase ?? p.status ?? "UNKNOWN";
                        return (
                          <div key={p.id} className="p-3 bg-secondary/15 rounded-xl border border-border flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.id} • {p.projectType}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {String(phase).replace(/_/g, " ")}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">Licensing Requests ({linkedRequests.length})</h4>
                  {linkedRequests.length === 0 ? (
                    <p className="text-muted-foreground py-2 text-center border border-dashed border-border rounded-lg">No active requests found</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedRequests.map((r) => (
                        <div key={r.id} className="p-3 bg-secondary/15 rounded-xl border border-border flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{r.facilityName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{r.jobNumber} • {r.requestType}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="space-y-2">
                {linkedInvoices.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">No invoices recorded for this client</p>
                ) : (
                  linkedInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-secondary/15 rounded-xl border border-border flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground">Invoice #{inv.id}</p>
                        <p className="text-[10px] text-muted-foreground">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{inv.grandTotal} SAR</p>
                        <Badge variant={inv.status === "paid" ? "default" : "destructive"} className="text-[9px] scale-90 origin-right">
                          {inv.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">Contracts ({linkedContracts.length})</h4>
                  {linkedContracts.length === 0 ? (
                    <p className="text-muted-foreground py-2 text-center border border-dashed border-border rounded-lg">No contracts registered</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedContracts.map((c) => (
                        <div key={c.id} className="p-3 bg-secondary/15 rounded-xl border border-border flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">Contract {c.id}</p>
                            <p className="text-[10px] text-muted-foreground">Created: {new Date(c.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {c.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground mb-2">Safety Certificates ({linkedCertificates.length})</h4>
                  {linkedCertificates.length === 0 ? (
                    <p className="text-muted-foreground py-2 text-center border border-dashed border-border rounded-lg">No compliance certificates issued</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedCertificates.map((cert) => (
                        <div key={cert.id} className="p-3 bg-secondary/15 rounded-xl border border-border flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{cert.title}</p>
                            <p className="text-[10px] text-muted-foreground">{cert.facilityName}</p>
                          </div>
                          <Badge variant={cert.status === "active" ? "default" : "secondary"} className="text-[10px]">
                            {cert.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setFormData({ ...customer }); setErrors({}); }}>
                {t("common:cancel")}
              </Button>
              <Button size="sm" onClick={handleSave}>
                {t("common:save")}
              </Button>
            </>
          ) : (
            <>
              {permissions.canManageCustomerProfile && activeTab === "overview" && (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  {t("common:edit")}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={onClose}>
                {t("common:close")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
