import { Request, Response, NextFunction } from 'express';
import { Extraction } from '../models/Extraction';
import { AISummary } from '../models/AISummary';
import { VoiceRecord } from '../models/VoiceRecord';
import { MedicalDocument } from '../models/Document';
import { Consultation } from '../models/Consultation';

export class ExtractionController {
  public static async getExtractionsByConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const { consultationId } = req.params;

      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ success: false, error: { message: 'Consultation not found' } });
      }

      const [extractions, summaries, voiceRecords, documents] = await Promise.all([
        Extraction.find({ consultationId }).sort({ createdAt: -1 }),
        AISummary.find({ consultationId }).sort({ createdAt: -1 }),
        VoiceRecord.find({ consultationId }).sort({ createdAt: -1 }),
        MedicalDocument.find({ patientId: consultation.patientId }).sort({ createdAt: -1 }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          consultation,
          extractions,
          summary: summaries[0] || null,
          voiceRecords,
          documents,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
