const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

const {
  getAllUserMovie,
  createMovie,
  deleteMovieById,
} = require("../controllers/movies");

router.get("/", getAllUserMovie);

router.post("/", createMovie);

router.delete(
  "/:movieId",
  celebrate({
    // валидируем параметры
    params: Joi.object().keys({
      movieId: Joi.string().alphanum().length(24),
    }),
  }),
  deleteMovieById
);

module.exports = router;
