import defaultOfficeDesignJson from "./defaultOfficeDesign.json" with { type: "json" };
import type { OfficeDesign } from "./types";

export const DEFAULT_DESIGN_VERSION = "hsab-default-2026-05-20-v1";

const officeDesign = defaultOfficeDesignJson as OfficeDesign;

export default officeDesign;
