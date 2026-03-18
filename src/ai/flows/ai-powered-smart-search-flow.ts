'use server';
/**
 * @fileOverview An AI agent that interprets natural language search queries
 * and extracts structured criteria for searching products and stores.
 *
 * - smartSearch - A function that handles the smart search process.
 * - SmartSearchInput - The input type for the smartSearch function.
 * - SmartSearchOutput - The return type for the smartSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
});
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

const SmartSearchOutputSchema = z.object({
  queryText: z.string().describe('The original natural language query.'),
  searchPurpose: z
    .enum(['find_stores', 'find_products', 'find_both', 'unknown'])
    .describe('The primary purpose of the search: finding stores, products, both, or if it is unclear.'),
  storeFilters: z
    .object({
      types: z.array(z.string()).describe('Types of stores requested (e.g., "restaurant", "cafe", "supermarket").'),
      cuisines: z.array(z.string()).describe('Specific cuisines or food types (e.g., "vegan", "Italian", "Mexican").'),
      dietaryNeeds: z.array(z.string()).describe('Dietary restrictions or preferences (e.g., "healthy", "gluten-free", "keto").'),
      attributes: z.array(z.string()).describe('General store attributes (e.g., "open late", "family-friendly", "delivery available", "with WiFi").'),
      keywords: z.array(z.string()).describe('General keywords related to stores that do not fit other categories.'),
    })
    .describe('Structured filters for searching stores.')
    .optional(),
  productFilters: z
    .object({
      categories: z.array(z.string()).describe('Product categories requested (e.g., "dinner", "dessert", "drinks", "snacks").'),
      dietaryNeeds: z.array(z.string()).describe('Dietary restrictions or preferences (e.g., "vegan", "organic", "low-carb").'),
      attributes: z.array(z.string()).describe('General product attributes (e.g., "spicy", "sweet", "freshly baked").'),
      keywords: z.array(z.string()).describe('General keywords related to products that do not fit other categories.'),
    })
    .describe('Structured filters for searching products.')
    .optional(),
  locationPreference: z.string().describe('User specified location preference (e.g., "near me", "downtown", "specific address").').optional(),
  timePreference: z.string().describe('User specified time preference (e.g., "for dinner", "for breakfast", "late night").').optional(),
  generalKeywords: z.array(z.string()).describe('Any remaining general keywords that apply broadly or are ambiguous.'),
});
export type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

export async function smartSearch(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: { schema: SmartSearchInputSchema },
  output: { schema: SmartSearchOutputSchema },
  prompt: `You are an intelligent search assistant for a delivery application named "Absher".
Your task is to parse a natural language query and extract specific criteria for searching stores and products.

Analyze the user's 'query' and populate the JSON output with all relevant search criteria.

Instructions:
1.  Determine the 'searchPurpose' based on whether the user is primarily looking for stores, products, both, or if it's unclear.
2.  Populate 'storeFilters' if the query implies searching for stores. Extract 'types', 'cuisines', 'dietaryNeeds', 'attributes', and 'keywords' specific to stores.
3.  Populate 'productFilters' if the query implies searching for products. Extract 'categories', 'dietaryNeeds', 'attributes', and 'keywords' specific to products.
4.  Extract any 'locationPreference' (e.g., "near me", "downtown") or 'timePreference' (e.g., "for dinner", "late night").
5.  Place any remaining general keywords or ambiguous terms into 'generalKeywords'.
6.  Ensure all arrays are populated with relevant strings, and if no items are found for an array, return an empty array.
7.  Do not include irrelevant or conversational text in the output JSON.

Examples:
User Query: "show me healthy vegan options for dinner"
Expected Output:
{
  "queryText": "show me healthy vegan options for dinner",
  "searchPurpose": "find_products",
  "productFilters": {
    "categories": ["dinner"],
    "dietaryNeeds": ["healthy", "vegan"],
    "attributes": [],
    "keywords": ["options"]
  },
  "generalKeywords": []
}

User Query: "find me a coffee shop open late near me"
Expected Output:
{
  "queryText": "find me a coffee shop open late near me",
  "searchPurpose": "find_stores",
  "storeFilters": {
    "types": ["coffee shop"],
    "cuisines": [],
    "dietaryNeeds": [],
    "attributes": ["open late"],
    "keywords": []
  },
  "locationPreference": "near me",
  "generalKeywords": []
}

User Query: "I want to order a burger"
Expected Output:
{
  "queryText": "I want to order a burger",
  "searchPurpose": "find_products",
  "productFilters": {
    "categories": [],
    "dietaryNeeds": [],
    "attributes": [],
    "keywords": ["burger"]
  },
  "generalKeywords": ["order"]
}

User Query: "Italian restaurants"
Expected Output:
{
  "queryText": "Italian restaurants",
  "searchPurpose": "find_stores",
  "storeFilters": {
    "types": ["restaurant"],
    "cuisines": ["Italian"],
    "dietaryNeeds": [],
    "attributes": [],
    "keywords": []
  },
  "generalKeywords": []
}

User Query: "anything healthy"
Expected Output:
{
  "queryText": "anything healthy",
  "searchPurpose": "find_both",
  "storeFilters": {
    "types": [],
    "cuisines": [],
    "dietaryNeeds": ["healthy"],
    "attributes": [],
    "keywords": ["anything"]
  },
  "productFilters": {
    "categories": [],
    "dietaryNeeds": ["healthy"],
    "attributes": [],
    "keywords": ["anything"]
  },
  "generalKeywords": []
}

User Query: "{{{query}}}"
`,
});

const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
