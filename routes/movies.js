const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

const { getAllUserMovie, createMovie } = require("../controllers/movies");

router.get("/", getAllUserMovie);

router.post("/", createMovie);

module.exports = router;
