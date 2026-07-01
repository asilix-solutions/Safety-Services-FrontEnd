import { redirect } from "next/navigation";

/**
 * @deprecated TEMPORARY DEPRECATED REDIRECT ROUTE
 * This route is obsolete and has been replaced by the Project Workspace tabs (/projects/[projectId]).
 * It will be removed permanently in the next phase.
 */
export default function DeprecatedRoute() {
  redirect("/projects");
}
