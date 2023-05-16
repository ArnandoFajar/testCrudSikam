const express = require("express");
const urlRoutes = express.Router();

const productController = require("../controllers/productController");

urlRoutes.post("/", productController.create);
urlRoutes.get("/", productController.getAll);
urlRoutes.get("/:id", productController.getByid);
urlRoutes.put("/:id", productController.update);
urlRoutes.delete("/:id", productController.delete);

module.exports = urlRoutes;
