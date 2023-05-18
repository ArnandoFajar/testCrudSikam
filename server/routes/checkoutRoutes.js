const express = require("express");
const urlRoutes = express.Router();

const checkoutController = require("../controllers/checkoutController");

urlRoutes.get("/detailcart", checkoutController.detailCart);
// urlRoutes.post("/", checkoutController.add);
// urlRoutes.get("/:id", checkoutController.getById);
// urlRoutes.put("/:id", checkoutController.update);
// urlRoutes.delete("/:id", checkoutController.delete);
// urlRoutes.delete("/", checkoutController.deleteAll);

module.exports = urlRoutes;
