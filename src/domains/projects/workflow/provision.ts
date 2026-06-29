import { LicensingRequest, WorkflowStage } from "@/domains/requests/types";
import { ClientPayment } from "@/domains/payments/types";
import { Project } from "@/types/project";
import { getProjects, provisionProjectFromRequest } from "@/domains/projects/storage";
import { upsertRequest } from "@/domains/requests/storage";
import { appendTimelineEvent } from "@/domains/quotations/workflow/helpers/timeline";

export function provisionProjectWorkspace({
  request,
  payment,
}: {
  request: LicensingRequest;
  payment?: ClientPayment;
}): Project {
  // Step 1: Validate Request
  if (request.currentStage !== "PAYMENT_CONFIRMED") {
    throw new Error("Request must be PAYMENT_CONFIRMED to provision project workspace.");
  }

  // Step 2: Prevent duplicate projects
  const projects = getProjects();
  const existingProject = projects.find((p) => p.jobNumber === request.jobNumber);
  if (existingProject) {
    return existingProject;
  }

  // Step 3 to 7: Provision and persist Project Workspace
  // (Delegating build/template/persistence details to Projects domain storage helper)
  const newProject = provisionProjectFromRequest(request);

  // Step 8: Update Request stage to PROJECT_CREATED and status to approved
  const requestWithUpdatedStage: LicensingRequest = {
    ...request,
    currentStage: "PROJECT_CREATED" as WorkflowStage,
    status: "approved" as const,
    updatedAt: new Date().toISOString(),
  };

  // Step 9: Append timeline event
  const updatedRequest = appendTimelineEvent(
    requestWithUpdatedStage,
    "approved",
    `Project Workspace Provisioned. Project ID: ${newProject.id}`
  );

  upsertRequest(updatedRequest);

  return newProject;
}
