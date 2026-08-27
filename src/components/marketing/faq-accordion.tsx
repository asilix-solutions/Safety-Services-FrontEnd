"use client";

import React, { useState } from "react";
import { useTranslation } from "@/providers/i18n-provider";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function FAQAccordion() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: t("marketing:faq_q1"),
      a: t("marketing:faq_a1"),
    },
    {
      q: t("marketing:faq_q2"),
      a: t("marketing:faq_a2"),
    },
    {
      q: t("marketing:faq_q3"),
      a: t("marketing:faq_a3"),
    },
    {
      q: t("marketing:faq_q4"),
      a: t("marketing:faq_a4"),
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("marketing:faq_badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            {t("marketing:faq_title")}
          </h2>
        </div>

        {/* Accordion Item List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-border/70 bg-card/75 backdrop-blur-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4 animate-in fade-in-50 duration-200">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
