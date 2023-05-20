const express = require("express");
const urlRoutes = express.Router();

const cancelOrderController = require("../controllers/cancelOrderController");

urlRoutes.post("/", cancelOrderController.create);
urlRoutes.get("/", cancelOrderController.getAll);
urlRoutes.get("/:id", cancelOrderController.getById);

module.exports = urlRoutes;
