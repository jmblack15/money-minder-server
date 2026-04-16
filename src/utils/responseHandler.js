const successResponse = (res, statusCode = 200, message, data) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
}

export { successResponse };