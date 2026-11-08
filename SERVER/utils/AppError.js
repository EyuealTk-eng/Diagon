// Errors that know their own status code
export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(msg = 'Bad request.') { return new AppError(msg, 400); }
  static unauthorized(msg = 'Unauthorized.') { return new AppError(msg, 401); }
  static forbidden(msg = 'Forbidden.') { return new AppError(msg, 403); }
  static notFound(msg = 'Not found.') { return new AppError(msg, 404); }
  static conflict(msg = 'Conflict.') { return new AppError(msg, 409); }
  static internal(msg = 'Something broke on our side.') { return new AppError(msg, 500); }
}
