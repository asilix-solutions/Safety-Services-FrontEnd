"use client";

import React from "react";
import { ClientRequestWizard } from "@/features/requests/client-request-wizard/client-request-wizard";

export default function NewRequestPage() {
  return (
    <div className="py-6">
      <ClientRequestWizard />
    </div>
  );
}
