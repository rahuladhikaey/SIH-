import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../models/Doctor';
import { AuditLogService } from '../services/auditLog.service';

export class DoctorController {
  public static async createDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.body.userId || req.user?.id;
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: { message: 'Target User ID is required' } });
      }

      const existingDoctor = await Doctor.findOne({
        $or: [{ userId: targetUserId }, { licenseNumber: req.body.licenseNumber }],
      });

      if (existingDoctor) {
        return res.status(400).json({ success: false, error: { message: 'Doctor profile or license number already registered.' } });
      }

      const doctor = await Doctor.create({
        ...req.body,
        userId: targetUserId,
      });

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'CREATE_DOCTOR',
        resource: 'Doctor',
        resourceId: doctor._id.toString(),
        details: { licenseNumber: doctor.licenseNumber, specialization: doctor.specialization },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const doctors = await Doctor.find().populate('userId', 'email fullName role isActive').sort({ createdAt: -1 });

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'LIST_DOCTORS',
        resource: 'Doctor',
        resourceId: 'ALL',
        details: { count: doctors.length },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await Doctor.findById(req.params.id).populate('userId', 'email fullName role isActive');
      if (!doctor) {
        return res.status(404).json({ success: false, error: { message: 'Doctor profile not found.' } });
      }

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'GET_DOCTOR_BY_ID',
        resource: 'Doctor',
        resourceId: doctor._id.toString(),
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, error: { message: 'Doctor profile not found.' } });
      }

      if (req.user?.role === 'doctor' && doctor.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: { message: 'Access denied to edit other doctor profiles.' } });
      }

      const beforeUpdate = doctor.toObject();
      Object.assign(doctor, req.body);
      await doctor.save();

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'UPDATE_DOCTOR',
        resource: 'Doctor',
        resourceId: doctor._id.toString(),
        details: { before: beforeUpdate, after: doctor.toObject() },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await Doctor.findByIdAndDelete(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, error: { message: 'Doctor profile not found.' } });
      }

      await AuditLogService.logAction({
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        actorRole: req.user?.role,
        action: 'DELETE_DOCTOR',
        resource: 'Doctor',
        resourceId: req.params.id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Doctor profile deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
