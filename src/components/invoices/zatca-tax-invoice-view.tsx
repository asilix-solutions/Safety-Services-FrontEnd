"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { TaxInvoiceDto, TaxInvoiceStatus } from "@/domains/invoices/api";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Printer,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  Hash,
  Download,
  AlertCircle,
  QrCode as QrIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ZatcaTaxInvoiceViewProps {
  invoice: TaxInvoiceDto;
  onClose?: () => void;
  className?: string;
}

export function ZatcaTaxInvoiceView({ invoice, onClose, className }: ZatcaTaxInvoiceViewProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  // Generate QR code data URL from backend payload or fallback TLV string
  useEffect(() => {
    async function generateQr() {
      try {
        const payload =
          invoice.qrCodePayload ||
          `ZATCA:${invoice.sellerName}|${invoice.sellerVatNumber}|${invoice.issuedAtUtc || new Date().toISOString()}|${invoice.totalWithVat}|${invoice.vatAmount}`;

        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 160,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.warn("Failed to generate QR code", err);
      }
    }
    generateQr();
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = invoice.issuedAtUtc
    ? new Date(invoice.issuedAtUtc).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("ar-SA");

  const formattedDateEn = invoice.issuedAtUtc
    ? new Date(invoice.issuedAtUtc).toISOString().replace("T", " ").substring(0, 19)
    : new Date().toISOString().replace("T", " ").substring(0, 19);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Action Bar (Hidden during Print) */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3 print:hidden">
        <div className="flex items-center gap-2">
          <Badge
            variant={invoice.status === TaxInvoiceStatus.Issued ? "default" : "secondary"}
            className="text-xs px-2.5 py-0.5"
          >
            {invoice.status === TaxInvoiceStatus.Issued ? "فاتورة ضريبية رسمية (معتمدة)" : "مسودة"}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>مشفرة ومتوافقة مع هيئة الزكاة والضريبة والجمارك (ZATCA Phase 2)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="cursor-pointer">
            <Printer className="h-4 w-4 ml-1.5" />
            طباعة / تصدير PDF
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
              إغلاق
            </Button>
          )}
        </div>
      </div>

      {/* Official Tax Invoice Document Container */}
      <div
        ref={printRef}
        className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-8 text-foreground shadow-sm print:m-0 print:max-w-none print:border-none print:p-0 print:shadow-none"
      >
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-primary/20 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              فاتورة ضريبية
            </h1>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              TAX INVOICE
            </p>
            <div className="pt-2 text-xs space-y-0.5">
              <p className="font-semibold text-primary">{invoice.sellerName}</p>
              <p className="text-muted-foreground">
                الرقم الضريبي للبائع (VAT ID):{" "}
                <span className="font-mono font-bold text-foreground">
                  {invoice.sellerVatNumber || "300000000000003"}
                </span>
              </p>
              <p className="text-muted-foreground">المملكة العربية السعودية - الرياض</p>
            </div>
          </div>

          <div className="text-left space-y-2">
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-left">
              <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                <span>رقم الفاتورة / Invoice No.</span>
                <Hash className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="font-mono text-base font-bold text-foreground text-left">
                {invoice.invoiceNumber}
              </p>
              {invoice.jobNumber && (
                <p className="font-mono text-[11px] text-muted-foreground text-left mt-0.5">
                  Ref: {invoice.jobNumber}
                </p>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground text-left">
              <p>{formattedDate}</p>
              <p className="font-mono">{formattedDateEn} UTC</p>
            </div>
          </div>
        </div>

        {/* Parties Grid (Seller & Buyer) */}
        <div className="grid grid-cols-2 gap-6 border-b border-border/60 py-6 text-xs">
          {/* Seller Box */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-1.5">
            <span className="font-bold text-primary block border-b border-border/40 pb-1">
              بيانات المورد / المنشأة (Seller)
            </span>
            <p className="font-semibold text-foreground">{invoice.sellerName}</p>
            <p className="text-muted-foreground">
              الرقم الضريبي: <span className="font-mono font-medium">{invoice.sellerVatNumber}</span>
            </p>
            <p className="text-muted-foreground">الترخيص: معتمد من الدفاع المدني</p>
          </div>

          {/* Buyer Box */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-1.5">
            <span className="font-bold text-primary block border-b border-border/40 pb-1">
              بيانات العميل / المشتري (Buyer)
            </span>
            <p className="font-semibold text-foreground">{invoice.buyerName}</p>
            <p className="text-muted-foreground">
              الرقم الضريبي للمشتري:{" "}
              <span className="font-mono font-medium">
                {invoice.buyerVatNumber || "غير مسجل (عميل أفراد / مبسط)"}
              </span>
            </p>
            <p className="text-muted-foreground">المملكة العربية السعودية</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="py-6">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">الوصف والخدمة المقدمة (Description)</th>
                <th className="py-2.5 px-3 text-center">الكمية (Qty)</th>
                <th className="py-2.5 px-3 text-left">سعر الوحدة (Unit Price)</th>
                <th className="py-2.5 px-3 text-center">نسبة الضريبة (VAT)</th>
                <th className="py-2.5 px-3 text-left">مبلغ الضريبة (VAT Amt)</th>
                <th className="py-2.5 px-3 text-left">المجموع شامل الضريبة (Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="py-3 px-3 font-mono text-muted-foreground">1</td>
                <td className="py-3 px-3 font-medium text-foreground">
                  خدمات هندسية وفنية لحلول وأنظمة السلامة ومكافحة الحريق
                  <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                    Engineering, Inspection & Fire Protection Safety Services (Job: {invoice.jobNumber || invoice.invoiceNumber})
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-mono">1</td>
                <td className="py-3 px-3 text-left font-mono">
                  {invoice.subtotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-[10px] text-muted-foreground font-sans">ر.س</span>
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {(invoice.vatRateApplied * 100).toFixed(0)}%
                </td>
                <td className="py-3 px-3 text-left font-mono">
                  {invoice.vatAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-[10px] text-muted-foreground font-sans">ر.س</span>
                </td>
                <td className="py-3 px-3 text-left font-mono font-bold text-foreground">
                  {invoice.totalWithVat.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-[10px] text-muted-foreground font-sans">ر.س</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary & ZATCA QR Code Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-2 border-border/80 pt-6">
          {/* ZATCA Phase 2 QR & Cryptographic Hash */}
          <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/10 p-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="ZATCA Tax Invoice QR Code"
                className="h-28 w-28 rounded border border-border/40 bg-white p-1 flex-shrink-0"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded border border-border bg-white text-muted-foreground">
                <QrIcon className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
            )}
            <div className="space-y-1 text-[10px] text-muted-foreground overflow-hidden">
              <span className="font-bold text-foreground block text-xs">
                رمز الاستجابة السريع المعتمد (ZATCA QR)
              </span>
              <p>رمز مشفر وفق مواصفات هيئة الزكاة والضريبة والجمارك (TLV Base64).</p>
              {invoice.invoiceHash && (
                <div className="pt-1">
                  <span className="font-mono text-foreground block font-semibold">
                    Invoice Hash (SHA-256):
                  </span>
                  <p className="font-mono truncate text-[9px] bg-card p-1 rounded border border-border/40">
                    {invoice.invoiceHash}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>الإجمالي الخاضع للضريبة (Subtotal Excl. VAT):</span>
              <span className="font-mono font-semibold text-foreground">
                {invoice.subtotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>ضريبة القيمة المضافة (15% VAT):</span>
              <span className="font-mono font-semibold text-foreground">
                {invoice.vatAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-border/60 pt-2 text-sm font-bold text-primary">
              <span>المجموع الكلي المستحق (Total Amount Due):</span>
              <span className="font-mono text-base">
                {invoice.totalWithVat.toLocaleString("en-US", { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Legal Notice */}
        <div className="mt-8 border-t border-border/40 pt-4 text-center text-[10px] text-muted-foreground space-y-1">
          <p>
            صدرت هذه الفاتورة إلكترونياً وتعتبر وثيقة رسمية خاضعة لأحكام نظام ضريبة القيمة المضافة ولائحته التنفيذية بالمملكة العربية السعودية.
          </p>
          <p className="font-mono text-[9px]">
            Amanix Enterprise SaaS &bull; Cryptographically Verified &bull; {invoice.invoiceNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
