require('dotenv').config();
// const { config } = require("dotenv");
const express = require('express');

const app = express(); // вызываем библиоетку express
const mongoose = require('mongoose');
// мостик между нодой и mongo
const { PORT = 3000, NODE_ENV, MONGO_ADR } = process.env; // локальный порт нашего сервера
const cors = require('cors'); // контролируем кросс-доменные запросы
const bodyParser = require('body-parser'); // преобразуем общение клиент-сервер в json
const { celebrate, Joi, errors } = require('celebrate');
// для защиты роутов валидацией
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
const { requestLogger, errorLogger } = require('./middlewares/logger'); // для ведения логов ошибок
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-error');

// порядок расположения обращений к app - КРАЙНЕ ВАЖЕН
mongoose.connect(
  NODE_ENV === 'production' ? MONGO_ADR : 'mongodb://localhost:27017/moviesdb',
  {},
); // даём знать мангусту где наша БД

app.use(requestLogger); // подключаем логгер запросов

const options = {
  origin: [
    'https://favmovies.nomoredomains.icu',
    'http://favmovies.nomoredomains.icu',
    'http://localhost:3001',
    'https://localhost:3001',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Content-Type',
    'origin',
    'Authorization',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Origin',
  ],
  credentials: true,
};

app.use('*', cors(options)); // ПЕРВЫМ!

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  createUser,
);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

/// вратА аутентификации\\\
app.use(auth);
/// вратА аутентификации\\\

app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.use((req, res, next) => {
  next(new NotFoundError('Такой страницы не существует'));
});

app.use(errorLogger); // подключаем логгер ошибок

// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate
app.use((err, req, res, next) => {
  // централизованный обработчик ошибок
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });

  next();
});

app.listen(PORT);
