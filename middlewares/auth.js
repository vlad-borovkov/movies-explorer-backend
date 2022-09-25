/* eslint-disable quotes */
const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauth-error");

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  let payload;
  // убеждаемся, что он есть и начинается с Bearer
  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new UnauthorizedError("Необходима авторизация"));
  } else {
    // верефицируем токен
    const token = authorization.replace("Bearer ", "");

    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
    );

    req.user = payload; // записываем пейлоуд в объект запроса
  }
  next(); // пропускаем запрос дальше
};
