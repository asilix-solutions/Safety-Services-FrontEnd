import { CustomerStatus } from "@/domains/customers/types";

export interface CustomerFilters {
  search: string;
  status: "All" | CustomerStatus;
  industry: string;
  city: string;
}
