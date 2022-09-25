/* eslint-disable func-names */
/* eslint-disable comma-dangle */
/* eslint-disable max-len */
/* eslint-disable quotes */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator"); // проверка селебрейтом
const UnauthError = require("../errors/unauth-error");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: "Некорректный Email",
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // необходимо добавить поле select, так по умолчанию хеш пароля пользователя не будет возвращаться из базы
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new UnauthError("Неправильные почта или пароль");
      }

      return (
        bcrypt
          .compare(password, user.password)
          // eslint-disable-next-line consistent-return
          .then((matched) => {
            if (!matched) {
              throw new UnauthError("Неправильные почта или пароль");
            }

            return user;
          })
      );
    });
};

function deletePasswordFromUser() {
  const obj = this.toObject();
  delete obj.password;
}

userSchema.methods.deletePasswordFromUser = deletePasswordFromUser;

module.exports = mongoose.model(
  "user",
  userSchema.index({ email: 1 }, { unique: true })
);
