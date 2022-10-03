const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

const {
  getAllUserMovie,
  createMovie,
  deleteMovieById,
} = require("../controllers/movies");

router.get("/", getAllUserMovie);

router.post(
  "/",
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required(),
      trailerLink: Joi.string().required(),
      thumbnail: Joi.string().required(),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie
);

router.delete(
  "/:movieId",
  celebrate({
    // валидируем параметры
    params: Joi.object().keys({
      movieId: Joi.string().hex().required().length(24),
    }),
  }),
  deleteMovieById
);

module.exports = router;
