/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserAvatar,
  getCurrentUser,
} = require("../controllers/users");

router.get("/me", getCurrentUser); // возвращает инфо о текущем пользователе при получении токена
router.get("/", getAllUsers);
router.get(
  "/:userId",
  celebrate({
    // валидируем параметры
    params: Joi.object().keys({
      userId: Joi.string().alphanum().length(24),
    }),
  }),
  getUserById
);

router.patch(
  "/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateUser
); // обновляет профиль
router.patch(
  "/me/avatar",
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().regex(
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
      ), // 1
    }),
  }),
  updateUserAvatar
); // обновляет аватар

module.exports = router;
