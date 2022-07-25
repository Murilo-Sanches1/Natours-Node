const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `${err.path} inválido (${err.value}).`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;

  const message = `Valor preenchido com: "${value}" já existe, por favor escolha outro!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Dados inválidos. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () => new AppError('Token inválido, por favor entre de novo', 401);
const handleJWTExpired = () => new AppError('Token expirado, por favor entre de novo', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Erro',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('Erro não previsto:', err);

    return res.status(500).json({
      status: 'error',
      message: 'Alguma coisa deu errada!',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Erro',
      msg: err.message,
    });
  }

  console.error('Erro não previsto:', err);

  return res.status(err.statusCode).render('error', {
    title: 'Erro',
    msg: 'Por favor tente de novo mais tarde',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Tour validation failed') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpired(error);

    sendErrorProd(error, req, res);
  }
};
