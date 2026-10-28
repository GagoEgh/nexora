export const MODEL_IDS = [
  'project-based',
  'dedicated-team',
  'long-term-partnership',
  'maintenance-support',
  'white-label',
] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export function isModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && (MODEL_IDS as readonly string[]).includes(value);
}

export function modelSectionId(model: ModelId): string {
  return `model-${model}`;
}
