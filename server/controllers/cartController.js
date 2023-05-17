const Moment = require("moment");
const CartModel = require("../models/cartModel");

exports.add = (req, res) => {
  // Validate
  if (!req.body) {
    return res.status(400).send({
      message: "request tidak boleh kosong!",
    });
  }
  if (!req.body.productid) {
    return res.status(400).send({
      message: "Productid tidak boleh Kosong!",
    });
  }
  if (!req.body.quantity) {
    return res.status(400).send({
      message: "Quantity tidak boleh kosong!",
    });
  }

  if (!Number.isInteger(req.body.quantity)) {
    return res.status(400).send({
      message: "Quantity wajib Angka!",
    });
  }

  //create Cart
  const cart = new CartModel({
    productid: req.body.productid,
    quantity: req.body.quantity,
    created_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  //insert Cart to database
  CartModel.create(cart, (err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi Error saat insert Data Keranjang",
      });
    else
      return res.status(200).send({
        message: "Data Keranjang berhasil ditambah",
        data: data,
      });
  });
};
exports.getAll = (req, res) => {};
exports.getById = (req, res) => {};
exports.update = (req, res) => {};
exports.deleteById = (req, res) => {};
exports.deleteAll = (req, res) => {};
