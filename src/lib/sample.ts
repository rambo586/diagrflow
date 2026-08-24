import { DIAGRAM_CASES } from "./cases";
import type { PrismaInput } from "./prisma";

/** @deprecated Use DIAGRAM_CASES[0]; kept for existing tests. */
export const SAMPLE_TITLE = DIAGRAM_CASES[0].notice;

export function samplePrismaInput(): PrismaInput {
  return DIAGRAM_CASES[0].input();
}
