import { ClosureMethod } from "@/domains/closure/types";

export const CLOSURE_METHOD_OPTIONS: ClosureMethod[] = ["canvas", "upload"];

export function methodLabelKey(method: ClosureMethod): string {
  return `closure:method.${method}`;
}
