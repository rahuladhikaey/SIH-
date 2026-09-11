import { Request, Response, NextFunction } from 'express';
import { AIJob } from '../models/AIJob';
import { Consultation } from '../models/Consultation';

export class JobController {
  /**
   * Get AI Job processing status
   */
  public static async getJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await AIJob.findById(req.params.jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: { message: `AI Job '${req.params.jobId}' not found.` },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          jobId: job._id,
          jobType: job.jobType,
          status: job.status,
          result: job.result,
          errorMessage: job.errorMessage,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Consultation lifecycle status & linked AI jobs
   */
  public static async getConsultationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const consultation = await Consultation.findById(req.params.consultationId);
      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: { message: `Consultation '${req.params.consultationId}' not found.` },
        });
      }

      const jobs = await AIJob.find({
        'payload.consultationId': consultation._id.toString(),
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: {
          consultationId: consultation._id,
          status: consultation.status,
          chiefComplaint: consultation.chiefComplaint,
          jobs: jobs.map((j) => ({
            id: j._id,
            type: j.jobType,
            status: j.status,
            createdAt: j.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
