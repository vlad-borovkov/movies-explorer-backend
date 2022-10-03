const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

const { updateUser, getCurrentUser } = require("../controllers/users");

router.get("/me", getCurrentUser); // возвращает инфо о текущем пользователе при получении токена

router.patch(
  "/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string()
        .required()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net", "ru"] },
        }),
    }),
  }),
  updateUser
); // обновляет профиль

module.exports = router;
