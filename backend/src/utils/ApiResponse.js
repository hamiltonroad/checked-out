class ApiResponse {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message = 'Error', statusCode = 500, extras = {}) {
    return {
      success: false,
      message,
      statusCode,
      ...extras,
    };
  }
}

module.exports = ApiResponse;
