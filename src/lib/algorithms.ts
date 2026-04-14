
import { SYMPTOM_DATASET, MedicalCondition } from '../data/medicalDataset';

/**
 * Core Algorithmic Processing: Symptom Matching
 * Uses a weighted Jaccard Similarity index combined with prevalence weighting
 * to suggest potential conditions based on user input.
 */
export function matchSymptoms(userInput: string): { condition: MedicalCondition; score: number }[] {
  const stopWords = new Set(['i', 'have', 'a', 'the', 'and', 'my', 'is', 'in', 'it', 'when', 'with', 'of', 'for', 'on', 'at', 'to', 'some', 'any']);
  const inputTokens = userInput.toLowerCase()
    .split(/[\s,.]+/).filter(token => token.length > 2 && !stopWords.has(token));
  
  if (inputTokens.length === 0) return [];

  return SYMPTOM_DATASET.map(condition => {
    let matchCount = 0;
    const conditionSymptoms = condition.commonSymptoms.map(s => s.toLowerCase());
    
    conditionSymptoms.forEach(symptom => {
      // Check if any input token matches the symptom or vice versa
      // We also check for partial matches (e.g., "shoulder" matches "shoulder pain")
      if (inputTokens.some(token => symptom.includes(token) || token.includes(symptom))) {
        matchCount++;
      }
    });

    // Jaccard-like similarity score
    // We use the number of matched symptoms relative to the condition's total symptoms
    // This makes it less sensitive to the length of the user's input sentence
    const similarity = matchCount / condition.commonSymptoms.length;
    
    // Weight by prevalence (logarithmic scale)
    const prevalenceWeight = Math.log10(condition.prevalence * 100 + 1) / 5;
    
    // Final score: heavily weighted towards symptom match
    const finalScore = (similarity * 0.95) + (prevalenceWeight * 0.05);

    return { condition, score: finalScore };
  })
  .filter(item => item.score > 0.1) // Lower threshold for better visibility
  .sort((a, b) => b.score - a.score);
}

/**
 * Core Algorithmic Processing: Triage Priority Scoring
 * Calculates a numerical priority score based on multiple clinical factors.
 */
export function calculatePriorityScore(data: {
  severity: number;
  durationDays: number;
  age: number;
  hasRedFlags: boolean;
  urgencyLevel: 'Low' | 'Medium' | 'High';
}): number {
  // Base score from severity (0-40)
  let score = data.severity * 4; 

  // Duration factor: Acute symptoms are often higher priority
  // But we don't want to over-boost
  if (data.durationDays <= 1) score += 10;
  else if (data.durationDays <= 3) score += 5;
  else if (data.durationDays > 14) score += 2;

  // Age factor: Infants and elderly are higher risk
  if (data.age < 5 || data.age > 65) score += 15;
  else if (data.age < 12 || data.age > 50) score += 5;

  // Urgency level boost (from AI triage)
  if (data.urgencyLevel === 'High') score += 25;
  else if (data.urgencyLevel === 'Medium') score += 10;

  // Red flag multiplier (Applied at the end for maximum impact)
  if (data.hasRedFlags) {
    score *= 1.4;
  }

  // Final normalization: Ensure it's a meaningful spread
  // High urgency with red flags and high severity should hit near 100
  // Low urgency with low severity should be near 10-20
  return Math.min(Math.max(Math.round(score), 0), 100);
}
