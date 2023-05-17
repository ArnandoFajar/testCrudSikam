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
exports.getAll = (res) => {
  CartModel.getAll((err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi error saat get all data Cart",
      });
    else return res.send(data);
  });
};
exports.getById = (req, res) => {
  CartModel.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Cart tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        return res.status(500).send({
          message: "Error get cart dari id " + req.params.id,
        });
      }
    } else return res.send(data);
  });
};
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    return res.status(400).send({
      message: "Request Tidak Boleh Kosong!",
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

  //update cart
  const cart = new CartModel({
    productid: req.body.productid,
    quantity: req.body.quantity,
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  CartModel.updateById(req.params.id, cart, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Cart tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        return res.status(500).send({
          message: "Error Update data cart dari id " + req.params.id,
        });
      }
    } else return res.send({ message: "Data berhasil diubah", data: data });
  });
};
exports.deleteById = (req, res) => {
  CartModel.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Cart tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        return res.status(500).send({
          message: "Tidak bisa menghapus cart dari id " + req.params.id,
        });
      }
    } else return res.send({ message: `Data Cart Berhasil Dihapus!` });
  });
};
exports.deleteAll = (req, res) => {
  CartModel.deleteAll((err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi Error saat menghapus semua cart",
      });
    else return res.send({ message: `Semua cart berhasil dihapus` });
  });
};
