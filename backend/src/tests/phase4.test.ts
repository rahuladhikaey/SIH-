import { Types } from 'mongoose';
import { AISummary } from '../models/AISummary';

describe('Phase 4: AISummary Model & RAG Structured Schema Unit Tests', () => {
  const patientId = new Types.ObjectId();
  const consultationId = new Types.ObjectId();

  it('should successfully validate an AISummary in PENDING_REVIEW state with structured output and evidence chunks', () => {
    const summary = new AISummary({
      patientId,
      consultationId,
      draftSummary: 'Patient presents with elevated blood pressure (150/95 mmHg).',
      keyFindings: ['Systolic BP 150', 'Diastolic BP 95'],
      suggestedDiagnosis: ['Stage 1 Hypertension'],
      structuredOutput: {
        patient_overview: '50-year-old patient evaluated for elevated blood pressure.',
        current_medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'QD', provenance: 'VOICE' }],
        investigations: ['ECG', 'Serum Creatinine'],
        risk_flags: [
          {
            severity: 'WARNING',
            description: 'Elevated resting blood pressure',
            action_required: 'Monitor BP daily',
          },
        ],
        missing_information: ['Verify previous antihypertensive drug adherence'],
        evidence_references: [
          {
            chunk_id: 'chk_hyp_01',
            source_doc: 'hypertension_guidelines.txt',
            snippet: 'Hypertension is defined as resting blood pressure >= 140/90 mmHg.',
            relevance_score: 0.92,
          },
        ],
      },
      originalAiOutput: '{"patient_overview": "50-year-old patient..."}',
      modelInfo: 'provider:mock/mock-gpt-4o-mini',
      evidenceChunks: [
        {
          chunk_id: 'chk_hyp_01',
          source_doc: 'hypertension_guidelines.txt',
          snippet: 'Hypertension is defined as resting blood pressure >= 140/90 mmHg.',
          relevance_score: 0.92,
        },
      ],
      status: 'PENDING_REVIEW',
      requiresReview: true,
    });

    const err = summary.validateSync();
    expect(err).toBeUndefined();
    expect(summary.status).toBe('PENDING_REVIEW');
    expect(summary.requiresReview).toBe(true);
    expect(summary.evidenceChunks).toHaveLength(1);
    expect(summary.structuredOutput?.patient_overview).toBe('50-year-old patient evaluated for elevated blood pressure.');
  });

  it('should reject invalid status field enum values', () => {
    const invalidSummary = new AISummary({
      patientId,
      consultationId,
      draftSummary: 'Invalid status test',
      status: 'AUTOMATICALLY_VERIFIED' as any,
    });

    const err = invalidSummary.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['status']).toBeDefined();
  });
});
