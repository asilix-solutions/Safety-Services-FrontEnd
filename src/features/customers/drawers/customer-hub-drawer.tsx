import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "@/providers/i18n-provider";
import { Customer } from "@/domains/customers/types";
import { CustomerValidationError } from "@/domains/customers/validation";
import { Building, Info, Users, Briefcase, Receipt, FileText } from "lucide-react";
import { getActiveRequests } from "@/domains/requests/storage";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { getActiveProjects } from "@/domains/projects/storage";
import { getInvoices } from "@/domains/invoices/storage";
import { getScopedContracts } from "@/domains/contracts/storage";
import { getScopedCertificates } from "@/domains/certificates/storage";

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
  const { t, dir } = useTranslation();
  const side = dir === "rtl" ? "right" : "left";
  const tenantContext = useTenantContext();
  const [activeTab, setActiveTab] = useState<"overview" | "representatives" | "records" | "invoices" | "documents">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Customer | null>(null);
  const [errors, setErrors] = useState<CustomerValidationError>({});

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(customer);

  useEffect(() => {
    if (customer) {
      setActiveCustomer(customer);
      setFormData({ ...customer });
      setIsEditing(initialEditMode);
      setErrors({});
      setActiveTab("overview");
    }
  }, [customer, initialEditMode, isOpen]);

  const currentCustomer = customer || activeCustomer;
  if (!currentCustomer || !formData) return null;

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
  const linkedRequests = getActiveRequests(tenantContext, undefined, currentCustomer.id);
  const linkedProjects = getActiveProjects(tenantContext, undefined, currentCustomer.id);
  const linkedInvoices = getInvoices().filter((i) => i.clientId === currentCustomer.id);
  const linkedContracts = getScopedContracts(tenantContext).filter((c) => c.clientId === currentCustomer.id);
  const linkedCertificates = getScopedCertificates(tenantContext).filter((c) => c.clientId === currentCustomer.id);

  const tabs = [
    { id: "overview", label: t("common:customers.tabs.overview"), icon: Info },
    { id: "representatives", label: t("common:customers.tabs.representatives"), icon: Users },
    { id: "records", label: t("common:customers.tabs.requests_projects"), icon: Briefcase },
    { id: "invoices", label: t("common:customers.tabs.invoices"), icon: Receipt },
    { id: "documents", label: t("common:customers.tabs.documents"), icon: FileText },
  ] as const;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side={side} className="w-full sm:max-w-xl h-full p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div>
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg font-bold text-foreground">{t("common:customers.details")}</SheetTitle>
              {!permissions.canManageCustomerProfile && (
                <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-muted text-muted-foreground border-border">
                  {t("common:read_only")}
                </Badge>
              )}
            </div>
            <SheetDescription className="text-xs text-muted-foreground font-mono mt-1">{currentCustomer.companyName}</SheetDescription>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/15">
            <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl">
              <Building className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">{currentCustomer.companyName}</h4>
              <p className="text-xs text-muted-foreground">{currentCustomer.industry}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant={currentCustomer.status === "Active" ? "default" : "secondary"}>
                  {t(`common:customers.status.${currentCustomer.status}`)}
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
                    <p className="text-sm font-medium text-foreground py-1">{currentCustomer.companyName}</p>
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
                    <p className="text-sm font-medium text-foreground py-1">{currentCustomer.commercialRegistration}</p>
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
                    <p className="text-sm font-medium text-foreground py-1">{currentCustomer.industry}</p>
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
                      <p className="text-sm font-medium text-foreground py-1">{currentCustomer.primaryContactName}</p>
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
                      <p className="text-sm font-medium text-foreground py-1">{currentCustomer.city}</p>
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
                      <p className="text-sm font-medium text-foreground py-1">{currentCustomer.primaryContactEmail}</p>
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
                      <p className="text-sm font-medium text-foreground py-1">{currentCustomer.primaryContactPhone}</p>
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
                    <p className="text-sm font-medium text-foreground py-1">{currentCustomer.address}</p>
                  )}
                  {errors.address && <p className="text-destructive text-[10px]">{t(`common:${errors.address}`)}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-[10px] text-muted-foreground">
                  <div>
                    <span>{t("common:customers.fields.created")}</span>
                    <span className="block font-medium mt-0.5">{new Date(currentCustomer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>{t("common:customers.fields.updated")}</span>
                    <span className="block font-medium mt-0.5">{new Date(currentCustomer.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "representatives" && (
              <div className="space-y-3">
                {currentCustomer.representatives.map((rep) => (
                  <div key={rep.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-sm">{rep.name}</p>
                      <p className="text-[10px] text-muted-foreground">{rep.role}</p>
                    </div>
                    <div className="text-end text-[10px] text-muted-foreground">
                      <p>{rep.email}</p>
                      <p>{rep.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "records" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">{t("common:customers.tabs.requests")}</h5>
                  {linkedRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t("common:customers.no_requests")}</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedRequests.map((req) => (
                        <div key={req.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{req.facilityName || req.requestType}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{req.jobNumber}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {req.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">{t("common:customers.tabs.projects")}</h5>
                  {linkedProjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t("common:customers.no_projects")}</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedProjects.map((proj) => (
                        <div key={proj.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{proj.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{proj.id}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {proj.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">{t("common:customers.tabs.invoices")}</h5>
                  {linkedInvoices.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t("common:customers.no_invoices")}</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedInvoices.map((inv) => (
                        <div key={inv.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{inv.grandTotal} {inv.currency}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{inv.id}</p>
                          </div>
                          <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-[10px]">
                            {inv.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">{t("common:customers.tabs.contracts")}</h5>
                  {linkedContracts.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t("common:customers.no_contracts")}</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedContracts.map((con) => (
                        <div key={con.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{con.title}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{con.id}</p>
                          </div>
                          <Badge variant={con.status === "signed" ? "default" : "secondary"} className="text-[10px]">
                            {con.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">{t("common:customers.tabs.certificates")}</h5>
                  {linkedCertificates.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t("common:customers.no_certificates")}</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedCertificates.map((cert) => (
                        <div key={cert.id} className="p-3 bg-secondary/10 border border-border rounded-xl flex justify-between items-center">
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
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setFormData({ ...currentCustomer }); setErrors({}); }}>
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
      </SheetContent>
    </Sheet>
  );
}
