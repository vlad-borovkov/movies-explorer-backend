/* eslint-disable object-curly-newline */
/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable quotes */
const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ConflictError = require("../errors/conflict-error");

const OK = {
  OK: 200,
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id) // методом поиска обращаемся к бд
    .orFail(() => {
      throw new NotFoundError("Указанный пользователь не найден");
    })
    .then((user) =>
      res.status(OK.OK).send({
        name: user.name,
        email: user.email,
      })
    )
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Переданы некорректные данные"));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        {
          expiresIn: "7d",
        }
      );
      res.status(200).send({ token });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { email, password, name, about, avatar } = req.body;

  bcrypt.hash(password, 10).then((hash) =>
    User.create({ email, password: hash, name, about, avatar })
      .then((user) => {
        res.status(OK.OK).send({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      })
      .catch((err) => {
        if (err.name === "ValidationError") {
          next(new BadRequestError("Переданы некорректные данные"));
        } else if (err.code === 11000) {
          next(new ConflictError("Такой пользователь уже существует"));
        } else {
          next(err);
        }
      })
  );
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true }
  )
    .orFail(() => {
      throw new NotFoundError("Пользователь с указанным _id не найден");
    })
    .then((user) =>
      res
        .status(OK.OK)
        .send({ _id: user._id, name: user.name, email: user.email })
    ) // что отправит?
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Переданы некорректные данные при обновлении профиля"
          )
        );
      } else {
        next(err);
      }
    });
};
