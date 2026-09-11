import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { config } from '../config';
import { AuditLogService } from '../services/auditLog.service';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role, fullName, licenseNumber, specialization, dob, gender } = req.body;

      const normalizedEmail = (email || '').trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { message: 'User with this email already exists.' },
        });
      }

      const user = new User({
        email: normalizedEmail,
        password,
        role,
        fullName: (fullName || '').trim(),
      });

      await user.save();

      let profile: any = null;

      if (role === 'patient') {
        let parsedDob = new Date('1990-01-01');
        if (dob) {
          const d = new Date(dob);
          if (!isNaN(d.getTime())) {
            parsedDob = d;
          }
        }
        profile = await Patient.create({
          userId: user._id,
          dob: parsedDob,
          gender: (gender || 'other').toLowerCase(),
        });
      } else if (role === 'doctor') {
        profile = await Doctor.create({
          userId: user._id,
          licenseNumber: licenseNumber || `MD-${user._id.toString().slice(-6).toUpperCase()}`,
          specialization: specialization || 'General Medicine',
        });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      await AuditLogService.logAction({
        actorId: user._id.toString(),
        actorEmail: user.email,
        actorRole: user.role,
        action: 'USER_REGISTER',
        resource: 'User',
        resourceId: user._id.toString(),
        details: { role: user.role, fullName: user.fullName },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          },
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;

      const normalizedEmail = (email || '').trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials. User account not found.' },
        });
      }

      // Perform role check BEFORE password comparison so user gets immediate tab guidance
      if (role && user.role !== role) {
        const correctTab = user.role === 'doctor' ? 'Doctor Login' : 'Patient Login';
        return res.status(400).json({
          success: false,
          error: {
            message: `This account is registered as a ${user.role.toUpperCase()}. Please click the '${correctTab}' tab above to sign in.`,
          },
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { message: 'Incorrect password. Please verify the password you entered during registration.' },
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: { message: 'Account is deactivated' },
        });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      await AuditLogService.logAction({
        actorId: user._id.toString(),
        actorEmail: user.email,
        actorRole: user.role,
        action: 'USER_LOGIN',
        resource: 'User',
        resourceId: user._id.toString(),
        details: { loginTime: new Date() },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
      }

      let profile: any = null;
      if (user.role === 'patient') {
        profile = await Patient.findOne({ userId: user._id });
        if (!profile) {
          profile = await Patient.create({
            userId: user._id,
            dob: new Date('1990-01-01'),
            gender: 'other',
          });
        }
      } else if (user.role === 'doctor') {
        profile = await Doctor.findOne({ userId: user._id });
        if (!profile) {
          profile = await Doctor.create({
            userId: user._id,
            licenseNumber: `MD-${user._id.toString().slice(-6).toUpperCase()}`,
            specialization: 'General Medicine',
          });
        }
      }

      res.status(200).json({
        success: true,
        data: { user, profile },
      });
    } catch (error) {
      next(error);
    }
  }
}
