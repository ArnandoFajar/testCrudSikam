const express = require("express");
const urlRoutes = express.Router();

const paymentController = require("../controllers/paymentController");

urlRoutes.post("/", paymentController.create);
urlRoutes.get("/", paymentController.getAll);
urlRoutes.get("/:id", paymentController.getById);

module.exports = urlRoutes;
