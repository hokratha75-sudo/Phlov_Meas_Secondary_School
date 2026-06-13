/**
 * Grading Utility for Cambodian Secondary School Standards
 * 
 * Formulas:
 * - Avg S1: (Monthly Scores Nov-Mar + S1 Exam) / Count
 * - Avg S2: (Monthly Scores Apr-Jul + S2 Exam) / Count
 * - Avg Annual: (Avg S1 + Avg S2) / 2
 * - Pass/Fail: Pass if Avg Annual >= 25.00 (out of 50)
 */

export interface StudentScore {
  studentId: number;
  month: string;
  subject: string;
  score: number;
}

export const MONTHS_S1 = ["November", "December", "January", "February", "March"];
export const MONTHS_S2 = ["April", "May", "June", "July"];

/**
 * Calculates the semester average based on monthly scores and exam scores.
 * Note: Real-world logic often involves weights or specific subject counts.
 * This function provides a standard base calculation.
 */
export function calculateSemesterAverage(monthlyScores: StudentScore[], examScores: StudentScore[]): number {
  const allScores = [...monthlyScores, ...examScores];
  if (allScores.length === 0) return 0;
  
  const sum = allScores.reduce((acc, curr) => acc + curr.score, 0);
  return sum / allScores.length;
}

/**
 * Calculates the annual average.
 */
export function calculateAnnualAverage(avgS1: number, avgS2: number): number {
  return (avgS1 + avgS2) / 2;
}

/**
 * Determines Pass/Fail status based on the annual average.
 * Standard threshold is 25.00 out of 50.
 */
export function determineResult(annualAvg: number): "Pass" | "Fail" {
  return annualAvg >= 25.00 ? "Pass" : "Fail";
}

/**
 * Maps Cambodian month names/order to semester groups
 */
export function getSemesterFromMonth(month: string): 1 | 2 | null {
  if (MONTHS_S1.includes(month)) return 1;
  if (MONTHS_S2.includes(month)) return 2;
  return null;
}

export interface SubjectConfig {
  subjectId: number;
  maxScore: number;
  isScienceTrack: boolean;
}

/**
 * Calculates a dynamic average based on subject configurations.
 * Weighted Average = (Actual Total / Total Max Possible) * targetBase (e.g., 50 or 10)
 */
export function calculateDynamicAverage(
  scores: StudentScore[], 
  configs: SubjectConfig[],
  targetBase: number = 50
): number {
  let actualTotal = 0;
  let totalMaxPossible = 0;

  // Group scores by subject to handle multiple entries (e.g. across months)
  const subjectScores: Record<string, number> = {};
  const subjectCounts: Record<string, number> = {};

  scores.forEach(s => {
    if (!subjectScores[s.subject]) {
      subjectScores[s.subject] = 0;
      subjectCounts[s.subject] = 0;
    }
    subjectScores[s.subject] += s.score;
    subjectCounts[s.subject] += 1;
  });

  // For each subject, find its config and add to totals
  Object.keys(subjectScores).forEach(subjectName => {
    // Note: This assumes subjects are matched by ID in the final implementation.
    // For now, we'll use a placeholder logic or assume subjectId is known.
    // In a real scenario, subjectId would be part of StudentScore.
    
    // Find config for this subject (assuming subjectId mapping is handled)
    const config = configs.find(c => c.subjectId.toString() === subjectName || c.subjectId === parseInt(subjectName));
    
    if (config) {
      const avgSubjectScore = subjectScores[subjectName] / subjectCounts[subjectName];
      actualTotal += avgSubjectScore;
      totalMaxPossible += config.maxScore;
    }
  });

  if (totalMaxPossible === 0) return 0;
  return (actualTotal / totalMaxPossible) * targetBase;
}
