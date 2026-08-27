import React from "react";
import { Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero-section";
import { CoreFeaturesGrid } from "@/components/marketing/core-features-grid";
import { LivePreviewShowcase } from "@/components/marketing/live-preview-showcase";
import { PricingAndPlans } from "@/components/marketing/pricing-and-plans";
import { FAQAccordion } from "@/components/marketing/faq-accordion";

export const metadata: Metadata = {
  title: "SSLM | المنصة السحابية الموحدة لشركات واستشارات السلامة والتراخيص الهندسية",
  description: "المنصة الرائدة في المملكة العربية السعودية لإدارة تراخيص الدفاع المدني، ومراجعة المخططات الهندسية، وحوكمة الزيارات الميدانية بنظام GPS والفوترة الإلكترونية ZATCA 15%.",
};

export default function MarketingLandingPage() {
  return (
    <div className="relative overflow-hidden">
      <HeroSection />
      <CoreFeaturesGrid />
      <LivePreviewShowcase />
      <PricingAndPlans />
      <FAQAccordion />
    </div>
  );
}
