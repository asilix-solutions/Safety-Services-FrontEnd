import { RequestType } from "../../requests/types";
import { CertificateType } from "../types";

export function mapRequestTypeToCertificateType(requestType: RequestType): CertificateType {
  switch (requestType) {
    case "maintenance_contract":
      return "maintenance";
    case "engineering_blueprint":
      return "installation";
    case "new_license":
    default:
      return "safety";
  }
}
