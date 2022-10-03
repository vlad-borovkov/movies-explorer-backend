const Movie = require("../models/movie");
const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");

module.exports.getAllUserMovie = (req, res, next) => {
  Movie.find({ owner: req.user._id }) // проверить, что летит строка
    .then((movies) => {
      res.send({ movies });
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Переданы некорректные данные при создании фильма"
          )
        );
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        next(new NotFoundError("Карточка с указанным _id не найдена"));
      } else if (movie.owner.toString() === req.user._id) {
        Movie.deleteOne({ _id: req.params.movieId }).then(
          res.send({ message: "Карточка удалена" })
        );
      } else {
        next(
          new ForbiddenError("Запрещено удалять карточки чужих пользователей")
        );
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Передан невалидный id"));
      } else {
        next(err);
      }
    });
};
