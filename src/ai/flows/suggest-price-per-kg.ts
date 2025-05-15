'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest an average price per KG based on historical delivery data.
 *
 * - suggestPricePerKg - A function that suggests the price per KG.
 * - SuggestPricePerKgInput - The input type for the suggestPricePerKg function.
 * - SuggestPricePerKgOutput - The return type for the suggestPricePerKg function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPricePerKgInputSchema = z.object({
  goods: z.string().describe('Description of the goods being transported.'),
  weightKg: z.number().describe('Weight of goods in kilograms.'),
  departureLocation: z.string().describe('Where the goods were picked up.'),
  destination: z.string().describe('Where the goods were delivered.'),
});

export type SuggestPricePerKgInput = z.infer<typeof SuggestPricePerKgInputSchema>;

const SuggestPricePerKgOutputSchema = z.object({
  suggestedPricePerKg: z.number().describe('The suggested price per kilogram in Ariary based on historical data.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});

export type SuggestPricePerKgOutput = z.infer<typeof SuggestPricePerKgOutputSchema>;

export async function suggestPricePerKg(input: SuggestPricePerKgInput): Promise<SuggestPricePerKgOutput> {
  return suggestPricePerKgFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPricePerKgPrompt',
  input: {schema: SuggestPricePerKgInputSchema},
  output: {schema: SuggestPricePerKgOutputSchema},
  prompt: `You are a logistics pricing expert. Based on historical delivery data, you will suggest an average price per KG for a new delivery.

Consider the following factors:
- Description of goods: {{{goods}}}
- Weight (kg): {{{weightKg}}}
- Departure Location: {{{departureLocation}}}
- Destination: {{{destination}}}

Provide a suggested price per KG in Ariary, along with a brief explanation of your reasoning.
`,
});

const suggestPricePerKgFlow = ai.defineFlow(
  {
    name: 'suggestPricePerKgFlow',
    inputSchema: SuggestPricePerKgInputSchema,
    outputSchema: SuggestPricePerKgOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
