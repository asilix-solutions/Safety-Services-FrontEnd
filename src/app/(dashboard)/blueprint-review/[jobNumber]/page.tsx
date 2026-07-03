"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BlueprintWorkspace } from "@/features/blueprint-review";

export default function WorkspaceRoutePage() {
  const params = useParams();
  const jobNumber = params?.jobNumber as string;

  return <BlueprintWorkspace jobNumber={jobNumber} />;
}
