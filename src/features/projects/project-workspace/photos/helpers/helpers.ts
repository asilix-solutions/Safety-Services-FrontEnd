import { SiloTag } from "@/domains/procurement/types";

export const SILO_TAG_OPTIONS: SiloTag[] = ["alarm", "suppression", "ventilation"];

export function siloLabelKey(silo: SiloTag): string {
  return `photos:silo.${silo}`;
}
