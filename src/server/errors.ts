export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function unauthorized(message = "Authentication required") {
  return new AppError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "You do not have permission to perform this action") {
  return new AppError(403, "FORBIDDEN", message);
}

export function notFound(message = "Resource not found") {
  return new AppError(404, "NOT_FOUND", message);
}

export function validationError(message = "Invalid input") {
  return new AppError(400, "VALIDATION_ERROR", message);
}

export function conflict(message = "Resource already exists") {
  return new AppError(409, "CONFLICT", message);
}

export function accountBanned(message = "Your account has been banned due to a violation of our content policy") {
  return new AppError(403, "ACCOUNT_BANNED", message);
}
