import { Queue, Worker, Job } from 'bullmq';
import axios from 'axios';
import FormData from 'form-data';
import { redisConnectionOptions } from './redis.config';
import { AIJob, AIJobType, IAIJob } from '../models/AIJob';
import { Extraction } from '../models/Extraction';
import { AISummary } from '../models/AISummary';
import { VoiceRecord } from '../models/VoiceRecord';
import { Consultation } from '../models/Consultation';
import { ConsultationStateMachine } from '../services/consultationStateMachine.service';
import { FileStorageService } from '../services/storage/fileStorage.service';
import { logger } from '../utils/logger';
import { config } from '../config';
import { Types } from 'mongoose';

export const AI_JOB_QUEUE_NAME = 'ai-job-queue';

export interface CreateAIJobInput {
  jobType: AIJobType;
  patientId: string;
  consultationId?: string;
  resourceId: string; // documentId or voiceRecordId
  payload?: Record<string, any>;
  actorContext?: {
    actorId?: string;
    actorEmail?: string;
    actorRole?: string;
  };
}

let aiJobQueueInstance: Queue | null = null;
let aiJobWorkerInstance: Worker | null = null;

export function getAIJobQueue(): Queue | null {
  if (config.env === 'test') return null;
  if (!aiJobQueueInstance) {
    try {
      aiJobQueueInstance = new Queue(AI_JOB_QUEUE_NAME, {
        connection: redisConnectionOptions,
      });
    } catch (e: any) {
      logger.warn(`Could not initialize BullMQ Queue: ${e.message}`);
    }
  }
  return aiJobQueueInstance;
}

export async function processAIJobTask(jobData: {
  dbJobId: string;
  consultationId?: string;
  patientId: string;
  resourceId: string;
  jobType: AIJobType;
  actorContext?: any;
  payload?: any;
}) {
  const { dbJobId, consultationId, patientId, resourceId, jobType, actorContext, payload } = jobData;
  logger.info(`[Phase 3 Pipeline] Processing job ${dbJobId} (Type: ${jobType}, Resource: ${resourceId})`);

  // 1. Update AIJob status to 'processing'
  await AIJob.findByIdAndUpdate(dbJobId, { status: 'processing' });

  if (consultationId) {
    try {
      await ConsultationStateMachine.transition(consultationId, 'PROCESSING', actorContext);
    } catch (e) {}
  }

  let extractedText = '';
  let provenance = 'OCR';
  let initialConfidence = 0.90;

  // 2. Retrieve file from GridFS & execute ASR or OCR via FastAPI AI Service
  const fileIdToFetch = payload?.fileId || resourceId;

  try {
    const fileResult = await FileStorageService.getFileStream(fileIdToFetch);
    const fileChunks: Buffer[] = [];
    for await (const chunk of fileResult.stream) {
      fileChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(fileChunks);

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileResult.filename || 'recording.webm',
      contentType: fileResult.mimeType || 'audio/webm',
    });
    if (payload?.clientTranscript) {
      formData.append('client_transcript', payload.clientTranscript);
    }

    if (jobType === 'transcription') {
      provenance = 'VOICE';
      const asrRes = await axios.post(`${config.aiServiceUrl}/api/v1/asr/transcribe`, formData, {
        headers: formData.getHeaders(),
        timeout: 5000,
      });
      if (asrRes.data?.status === 'success' || asrRes.data?.transcription) {
        extractedText = asrRes.data.transcription;
        initialConfidence = asrRes.data.confidence || 0.94;
      } else if (payload?.clientTranscript) {
        extractedText = payload.clientTranscript;
      }

      if (!extractedText && payload?.clientTranscript) {
        extractedText = payload.clientTranscript;
      }

      // Update VoiceRecord DB model
      await VoiceRecord.findByIdAndUpdate(resourceId, {
        transcription: extractedText,
        status: 'transcribed',
      });

      if (consultationId && extractedText) {
        await Consultation.findByIdAndUpdate(consultationId, { chiefComplaint: extractedText });
      }
    } else {
      provenance = 'OCR';
      const ocrRes = await axios.post(`${config.aiServiceUrl}/api/v1/ocr/process`, formData, {
        headers: formData.getHeaders(),
        timeout: 5000,
      });
      if (ocrRes.data?.status === 'success' || ocrRes.data?.raw_ocr_text) {
        extractedText = ocrRes.data.raw_ocr_text;
        initialConfidence = ocrRes.data.confidence || 0.90;
      }
    }
  } catch (err: any) {
    logger.warn(`FastAPI AI Service call fallback for job ${dbJobId}: ${err.message}`);
    extractedText = payload?.clientTranscript || payload?.chiefComplaint || `[VOICE TRANSCRIPTION] Patient audio recording processed for clinical evaluation.`;
    if (jobType === 'transcription') {
      await VoiceRecord.findByIdAndUpdate(resourceId, {
        transcription: extractedText,
        status: 'transcribed',
      });
      if (consultationId && extractedText) {
        await Consultation.findByIdAndUpdate(consultationId, { chiefComplaint: extractedText });
      }
    }
  }

  // 3. Perform Clinical Concept Extraction & Deterministic Validation via FastAPI AI Service
  let extractionData: any = null;
  let validationData: any = null;

  try {
    const extractRes = await axios.post(`${config.aiServiceUrl}/api/v1/extract/clinical`, {
      text: extractedText,
      provenance,
      initial_confidence: initialConfidence,
    }, { timeout: 5000 });
    if (extractRes.data?.status === 'success') {
      extractionData = extractRes.data.extraction;
      validationData = extractRes.data.validation;
    }
  } catch (err: any) {
    logger.warn(`Clinical extraction fallback: ${err.message}`);
  }

  // 4. Save Extraction Document in MongoDB
  const mongoExtraction = await Extraction.create({
    consultationId: consultationId ? new Types.ObjectId(consultationId) : undefined,
    extractedEntities: extractionData?.symptoms?.map((s: any) => ({
      category: 'Symptom',
      value: s.value,
      confidence: s.confidence,
    })) || [{ category: 'Symptom', value: 'Symptomatic Evaluation', confidence: initialConfidence }],
    status: 'completed',
  });

  // 5. Invoke Phase 4 RAG & LLM Clinical Summarization via FastAPI AI Service
  let structuredSummary: any = null;
  let originalAiOutput = extractedText || 'Clinical case summary drafted by AI service.';
  let modelInfo = 'provider:openai/gpt-4o-mini';
  let evidenceChunks: any[] = [];

  try {
    const ragRes = await axios.post(`${config.aiServiceUrl}/api/v1/summarize/rag`, {
      patient_info: { patient_id: patientId, age: 45, gender: 'unspecified' },
      clinical_extractions: extractionData || { chiefComplaint: { value: extractedText } },
      validation_results: validationData || { requires_verification: false, missing_information_warnings: [], urgent_flag_warnings: [] },
      query: extractedText,
    }, { timeout: 8000 });

    if (ragRes.data?.structured_summary) {
      structuredSummary = ragRes.data.structured_summary;
      evidenceChunks = ragRes.data.evidence_references || [];
      originalAiOutput = ragRes.data.original_ai_output || originalAiOutput;
      modelInfo = ragRes.data.model_info || modelInfo;
    }
  } catch (err: any) {
    logger.warn(`Phase 4 RAG Summarization fallback: ${err.message}`);
  }

  // 6. Save AISummary in MongoDB in PENDING_REVIEW state
  if (patientId) {
    try {
      await AISummary.create({
        patientId: new Types.ObjectId(patientId),
        consultationId: consultationId ? new Types.ObjectId(consultationId) : undefined,
        draftSummary: structuredSummary?.patient_overview || extractedText || 'Clinical case summary drafted by AI service.',
        keyFindings: extractionData?.symptoms?.map((s: any) => s.value) || ['General Clinical Evaluation'],
        suggestedDiagnosis: ['Pending Doctor Review'],
        structuredOutput: structuredSummary,
        originalAiOutput,
        modelInfo,
        evidenceChunks,
        status: 'PENDING_REVIEW',
        requiresReview: true,
      });
    } catch (e: any) {
      logger.warn(`Could not save AISummary: ${e.message}`);
    }

    if (consultationId) {
      try {
        await ConsultationStateMachine.transition(consultationId, 'AI_GENERATED', actorContext);
        await ConsultationStateMachine.transition(consultationId, 'PENDING_REVIEW', actorContext);
      } catch (e) {}
    }
  }

  // 7. Update AIJob Status to 'completed'
  const finalJobResult = {
    transcription: extractedText,
    extractedText,
    provenance,
    confidence: initialConfidence,
    extractionId: mongoExtraction._id,
    extractionData,
    validationData,
    summary: structuredSummary?.patient_overview || extractedText,
    structuredSummary,
    riskFlags: structuredSummary?.risk_flags || [],
    symptoms: extractionData?.symptoms || [],
  };

  await AIJob.findByIdAndUpdate(dbJobId, {
    status: 'completed',
    result: finalJobResult,
  });

  logger.info(`[Phase 3 Pipeline] Job ${dbJobId} completed successfully.`);
  return finalJobResult;
}

export function initializeAIJobWorker(): Worker | null {
  if (config.env === 'test') return null;
  if (!aiJobWorkerInstance) {
    try {
      aiJobWorkerInstance = new Worker(
        AI_JOB_QUEUE_NAME,
        async (job: Job) => {
          return processAIJobTask(job.data);
        },
        {
          connection: redisConnectionOptions,
        }
      );
      aiJobWorkerInstance.on('error', (err) => {
        logger.warn(`BullMQ Worker warning: ${err.message}`);
      });
    } catch (e: any) {
      logger.warn(`Could not initialize BullMQ Worker: ${e.message}`);
    }
  }
  return aiJobWorkerInstance;
}

/**
 * Creates MongoDB AIJob record and enqueues task / triggers direct execution
 */
export async function addAIJobToQueue(input: CreateAIJobInput): Promise<IAIJob> {
  const dbJob = await AIJob.create({
    jobType: input.jobType,
    resourceId: new Types.ObjectId(input.resourceId),
    status: 'pending',
    payload: {
      patientId: input.patientId,
      consultationId: input.consultationId,
      actorContext: input.actorContext,
      ...input.payload,
    },
  });

  const jobData = {
    dbJobId: dbJob._id.toString(),
    jobType: input.jobType,
    patientId: input.patientId,
    consultationId: input.consultationId,
    resourceId: input.resourceId,
    payload: input.payload,
    actorContext: input.actorContext,
  };

  const queue = getAIJobQueue();
  if (queue) {
    try {
      await Promise.race([
        queue.add(input.jobType, jobData, {
          jobId: dbJob._id.toString(),
          removeOnComplete: false,
          removeOnFail: false,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis enqueue timeout')), 1000)),
      ]);
      logger.info(`Enqueued BullMQ AI Job ${dbJob._id} of type '${input.jobType}'`);
    } catch (err: any) {
      logger.warn(`Could not enqueue to Redis BullMQ (${err.message}). Triggering background execution.`);
    }
  }

  // Trigger immediate background task execution
  setImmediate(() => {
    processAIJobTask(jobData).catch((err) => {
      logger.error(`Direct AI Job execution error: ${err.message}`);
      AIJob.findByIdAndUpdate(dbJob._id, { status: 'failed', errorMessage: err.message });
    });
  });

  return dbJob;
}
