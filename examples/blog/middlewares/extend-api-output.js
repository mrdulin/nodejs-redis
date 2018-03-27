module.exports = function extendApiOutput(req, res, next) {
  function apiSuccess(data) {
    res.json({
      status: 'ok',
      result: data
    });
  }

  function apiError(err) {
    res.json({
      status: 'error',
      errorCode: err.errorCode || 'UNKNOWN',
      errorMessage: err.errorMessage || err.message
    });
  }

  res.apiSuccess = apiSuccess;
  res.apiError = apiError;

  next();
};
