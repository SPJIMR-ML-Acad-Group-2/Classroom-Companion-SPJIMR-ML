/**
 * AI Service Layer
 *
 * This service provides placeholder methods for AI-powered features.
 * In the future, these will make HTTP calls to a Python FastAPI server.
 * For now, they return mock responses.
 */

export const aiService = {
  /**
   * Detect students at risk of falling below attendance threshold.
   * Future: calls Python ML model to predict at-risk students.
   */
  async detectAttendanceRisk(divisionId: string): Promise<{
    atRiskStudents: Array<{
      userId: string;
      name: string;
      currentPercentage: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      recommendation: string;
    }>;
  }> {
    // Mock response — replace with HTTP call to FastAPI
    console.log(`[AI Service] detectAttendanceRisk called for division: ${divisionId}`);
    return {
      atRiskStudents: [
        {
          userId: 'mock-student-1',
          name: 'Mock Student',
          currentPercentage: 68,
          riskLevel: 'HIGH',
          recommendation: 'Student has missed 5 consecutive sessions. Consider reaching out.',
        },
      ],
    };
  },

  /**
   * Auto-categorize uploaded material based on content analysis.
   * Future: calls NLP model to classify material type and map to course outline.
   */
  async autoCategorizeMaterial(materialData: {
    title: string;
    fileName?: string;
    description?: string;
  }): Promise<{
    suggestedCategory: string;
    confidence: number;
    suggestedSessionNumber: number | null;
  }> {
    console.log(`[AI Service] autoCategorizeMaterial called for: ${materialData.title}`);
    return {
      suggestedCategory: 'LECTURE_NOTES',
      confidence: 0.85,
      suggestedSessionNumber: null,
    };
  },

  /**
   * Detect workload imbalance across divisions or weeks.
   * Future: calls analytics service to identify scheduling anomalies.
   */
  async detectWorkloadImbalance(batchId: string): Promise<{
    imbalances: Array<{
      divisionName: string;
      weekStart: string;
      classCount: number;
      averageCount: number;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
  }> {
    console.log(`[AI Service] detectWorkloadImbalance called for batch: ${batchId}`);
    return {
      imbalances: [
        {
          divisionName: 'Division A',
          weekStart: '2025-01-20',
          classCount: 12,
          averageCount: 8,
          severity: 'MEDIUM',
        },
      ],
    };
  },
};
