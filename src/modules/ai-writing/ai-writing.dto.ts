import { z } from 'zod';

/**
 * Generate Paragraph Schema
 *
 * The server keeps no state between turns, so each refinement resends the
 * idea plus every earlier draft and the feedback given on it.
 */
export const generateParagraphSchema = z.object({
  idea: z.string().trim().min(1, 'Describe your idea first').max(2000),
  revisions: z
    .array(
      z.object({
        text: z.string().max(5000),
        feedback: z.string().trim().min(1, 'Say what to change').max(1000),
      }),
    )
    .max(10, 'Too many refinements - start a new one'),
});

/**
 * Type Definitions
 */
export type GenerateParagraphDto = z.infer<typeof generateParagraphSchema>;
