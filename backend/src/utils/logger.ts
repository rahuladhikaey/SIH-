import winston from 'winston';

const SENSITIVE_KEYS = [
  'password',
  'jwt',
  'jwtsecret',
  'secret',
  'token',
  'authorization',
  'auth',
  'bearer',
  'access_token',
  'refresh_token',
  'ssn',
  'credit_card'
];

/**
 * Recursively sanitize log objects to strip passwords, tokens, JWT secrets, and PII
 */
function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitize(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
}

const redactFormat = winston.format((info) => {
  return sanitize(info);
})();

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    redactFormat,
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        redactFormat,
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
