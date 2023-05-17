const express = require("express");
const urlRoutes = express.Router();

const cartController = require("../controllers/cartController");

urlRoutes.post("/", cartController.add);
urlRoutes.get("/", cartController.getAll);
urlRoutes.get("/:id", cartController.getById);
urlRoutes.put("/:id", cartController.update);
urlRoutes.delete("/:id", cartController.delete);
urlRoutes.delete("/", cartController.deleteAll);

module.exports = urlRoutes;
