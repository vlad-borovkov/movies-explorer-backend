const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getAllUserMovie,
  createMovie,
  deleteMovieById,
} = require('../controllers/movies');

const urlPattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;

router.get('/', getAllUserMovie);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().regex(urlPattern),
      trailerLink: Joi.string().required().regex(urlPattern),
      thumbnail: Joi.string().required().regex(urlPattern),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/:movieId',
  celebrate({
    // валидируем параметры
    params: Joi.object().keys({
      movieId: Joi.string().hex().required().length(24),
    }),
  }),
  deleteMovieById,
);

module.exports = router;
