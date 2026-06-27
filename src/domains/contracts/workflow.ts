import { Project } from "@/types/project";
import { LicensingRequest } from "@/domains/requests/types";
import { ClientContract } from "./types";
import { canGenerateContract, canSignContract, canArchiveContract } from "@/domains/workflow-validation";
import { getContractByProjectId, createOrUpdateContract, getContractById } from "./storage";
import { getQuotations } from "../quotations/storage";

export function generateContractFromCompletedProject(
  project: Project,
  request?: LicensingRequest | null
): ClientContract {
  const existing = getContractByProjectId(project.id);
  const validation = canGenerateContract(project, existing);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  // Look for quotation to get the contract value, or fallback to a default
  let value = 15000;
  if (project.jobNumber) {
    try {
      const quotations = getQuotations();
      const quotation = quotations.find((q) => q.jobNumber === project.jobNumber);
      if (quotation) {
        value = quotation.grandTotal;
      }
    } catch (e) {
      console.error("Failed to read quotation grand total", e);
    }
  }

  const nowStr = new Date().toISOString();
  const contract: ClientContract = {
    id: `CON-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: project.tenantId,
    clientId: project.clientId,
    projectId: project.id,
    jobNumber: project.jobNumber || "",
    title: `${project.name} - Completion Agreement`,
    value,
    status: "generated",
    createdAt: nowStr,
    documentUrl: `#`, // mock link for simulated download
  };

  createOrUpdateContract(contract);
  return contract;
}

export function signContract(contractId: string, signerName: string): ClientContract {
  const contract = getContractById(contractId);
  const validation = canSignContract(contract);
  if (!validation.valid || !contract) {
    throw new Error(validation.reason);
  }

  const updated: ClientContract = {
    ...contract,
    status: "signed",
    signedAt: new Date().toISOString(),
    signedBy: signerName,
  };

  createOrUpdateContract(updated);
  return updated;
}

export function archiveContract(contractId: string, archivedBy?: string): ClientContract {
  const contract = getContractById(contractId);
  const validation = canArchiveContract(contract);
  if (!validation.valid || !contract) {
    throw new Error(validation.reason);
  }

  const updated: ClientContract = {
    ...contract,
    status: "archived",
    archivedAt: new Date().toISOString(),
    archivedBy: archivedBy ?? "Company Admin",
  };

  createOrUpdateContract(updated);
  return updated;
}
