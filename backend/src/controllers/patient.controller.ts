import { Request, Response, NextFunction } from 'express';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { AuditLogService } from '../services/auditLog.service';

export class PatientController {
  public static async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.body.userId || req.user?.id;
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: { message: 'Target User ID is required' } });
      }

      const existingPatient = await Patient.findOne({ userId: targetUserId });
      if (existingPatient) {
        return res.status(400).json({ success: false, error: { message: 'Patient profile already exists for this user.' } });
      }

      const patient = await Patient.create({
        ...req.body,
        userId: targetUserId,
      });

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'CREATE_PATIENT',
        resource: 'Patient',
        resourceId: patient._id.toString(),
        details: { dob: patient.dob, gender: patient.gender },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await Patient.find().populate('userId', 'email fullName role isActive').sort({ createdAt: -1 });

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'LIST_PATIENTS',
        resource: 'Patient',
        resourceId: 'ALL',
        details: { count: patients.length },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await Patient.findById(req.params.id).populate('userId', 'email fullName role isActive');
      if (!patient) {
        return res.status(404).json({ success: false, error: { message: 'Patient profile not found.' } });
      }

      // Check ownership if role is patient
      if (req.user?.role === 'patient' && patient.userId._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: { message: 'Access denied to other patient profiles.' } });
      }

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'GET_PATIENT_BY_ID',
        resource: 'Patient',
        resourceId: patient._id.toString(),
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ success: false, error: { message: 'Patient profile not found.' } });
      }

      if (req.user?.role === 'patient' && patient.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: { message: 'Access denied to edit other patient profiles.' } });
      }

      const beforeUpdate = patient.toObject();
      Object.assign(patient, req.body);
      await patient.save();

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'UPDATE_PATIENT',
        resource: 'Patient',
        resourceId: patient._id.toString(),
        details: { before: beforeUpdate, after: patient.toObject() },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await Patient.findByIdAndDelete(req.params.id);
      if (!patient) {
        return res.status(404).json({ success: false, error: { message: 'Patient profile not found.' } });
      }

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'DELETE_PATIENT',
        resource: 'Patient',
        resourceId: req.params.id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Patient profile deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
