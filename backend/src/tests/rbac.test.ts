import { Request, Response, NextFunction } from 'express';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { UserRole } from '../models/User';
import './setup';

describe('RBAC Authorization Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should deny access when user object is missing (401)', () => {
    mockRequest = {};
    const middleware = authorizeRoles('doctor', 'admin');
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should deny access when user role is patient trying to access doctor routes (403)', () => {
    mockRequest = {
      user: {
        id: '123',
        email: 'patient@example.com',
        role: 'patient' as UserRole,
        fullName: 'Patient User',
      },
    };
    const middleware = authorizeRoles('doctor', 'admin');
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining("Role 'patient' is not authorized"),
        }),
      })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should allow access when user role is doctor (calls next())', () => {
    mockRequest = {
      user: {
        id: '456',
        email: 'doctor@example.com',
        role: 'doctor' as UserRole,
        fullName: 'Dr. Smith',
      },
    };
    const middleware = authorizeRoles('doctor', 'admin');
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow access when user role is admin (calls next())', () => {
    mockRequest = {
      user: {
        id: '789',
        email: 'admin@example.com',
        role: 'admin' as UserRole,
        fullName: 'Admin User',
      },
    };
    const middleware = authorizeRoles('doctor', 'admin');
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });
});
