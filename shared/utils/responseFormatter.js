export const success = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

export const created = (res, data) =>
  res.status(201).json({ success: true, data });

export const noContent = (res) =>
  res.status(204).send();

export const error = (res, message, status = 500, code = "SERVER_ERROR") =>
  res.status(status).json({ success: false, error: { message, code } });

export const validationError = (res, message) =>
  error(res, message, 422, "VALIDATION_ERROR");

export const notFound = (res, message = "Not found") =>
  error(res, message, 404, "NOT_FOUND");

export const forbidden = (res, message = "Access denied") =>
  error(res, message, 403, "FORBIDDEN");

export const unauthorized = (res, message = "Unauthorized") =>
  error(res, message, 401, "UNAUTHORIZED");

export const conflict = (res, message) =>
  error(res, message, 409, "CONFLICT");
