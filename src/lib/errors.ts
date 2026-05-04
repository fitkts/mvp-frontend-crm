export class AppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super('NOT_FOUND', message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error') {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super('CONFLICT', message, 409);
  }
}
