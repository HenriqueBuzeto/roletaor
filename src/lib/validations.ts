import { z } from "zod";

export const PrizeSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z
    .string()
    .trim()
    .min(1, "O nome do prêmio não pode ser vazio")
    .max(32, "O nome do prêmio deve ter no máximo 32 caracteres"),
  active: z.boolean(),
  probability: z.number().min(0.01).max(100).optional(),
  color: z.string().optional(),
  createdAt: z.number(),
});

export const SettingsSchema = z.object({
  spinDuration: z.number().min(3).max(12).default(10),
  soundEnabled: z.boolean().default(false),
  confettiEnabled: z.boolean().default(true),
  presentationMode: z.boolean().default(false),
  fullScreen: z.boolean().default(false),
  orientationRotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).default(0),
});

export const SpinResultSchema = z.object({
  id: z.string(),
  prizeId: z.string(),
  prizeName: z.string(),
  timestamp: z.number(),
});

export const WheelExportDataSchema = z.object({
  version: z.literal(1),
  prizes: z.array(PrizeSchema).min(2, "Mínimo de 2 prêmios necessários"),
  settings: SettingsSchema,
  history: z.array(SpinResultSchema).optional(),
});

export type WheelExportData = z.infer<typeof WheelExportDataSchema>;

export const DEFAULT_PRIZES = [
  { id: "p-1", name: "BRINDE", active: true, createdAt: 1 },
  { id: "p-2", name: "SURPRESA", active: true, createdAt: 2 },
  { id: "p-3", name: "PRÊMIO", active: true, createdAt: 3 },
  { id: "p-4", name: "MIMO", active: true, createdAt: 4 },
  { id: "p-5", name: "PRESENTE", active: true, createdAt: 5 },
  { id: "p-6", name: "BRINDE", active: true, createdAt: 6 },
  { id: "p-7", name: "SURPRESA", active: true, createdAt: 7 },
  { id: "p-8", name: "PRÊMIO", active: true, createdAt: 8 },
];
