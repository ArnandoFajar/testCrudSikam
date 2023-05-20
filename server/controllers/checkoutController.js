const Moment = require("moment");
const CheckoutModel = require("../models/checkoutModel");

exports.detailCart = (req, res) => {
  CheckoutModel.detailCart((err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Terjadi error saat get all details data Cart",
      });
    } else return res.send(data);
  });
};

exports.create = (req, res) => {
  // Validate
  if (!req.body) {
    return res.status(400).send({
      message: "request tidak boleh kosong!",
    });
  }
  if (!req.body.total) {
    return res.status(400).send({
      message: "Total tidak boleh Kosong!",
    });
  }
  if (!Number.isInteger(req.body.total)) {
    return res.status(400).send({
      message: "Total wajib Angka!",
    });
  }

  if (!req.body.cart) {
    return res.status(400).send({
      message: "status payment tidak boleh kosong!",
    });
  }

  //create checkout
  const checkout = new CheckoutModel({
    total: req.body.total,
    statusorder: "menunggupembayaran",
    statuspayment: "belumbayar",
    cart: req.body.cart,
    created_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  CheckoutModel.create(checkout, (err, data) => {
    console.log({ err, data });
    if (err) {
      if (err.kind === "not_found") {
        return res.status(400).send({
          message: `Product tidak ditemukan`,
        });
      } else if (err.kind === "stok_kurang") {
        return res.status(400).send({
          message: `Stok produk ${err.productname} tidak cukup`,
        });
      } else {
        return res.status(500).send({
          message:
            err.message + " on =>" + err.error ||
            "Terjadi error saat create checkout",
        });
      }
    } else
      return res.status(200).send({
        message: "Checkout berhasil dibuat",
        data: data,
      });
  });
};

exports.getAll = (req, res) => {
  CheckoutModel.getAll((err, data) => {
    if (err) {
      return res.status(500).send({
        message:
          err.message + " on =>" + err.error ||
          "Terjadi error saat create checkout",
      });
    } else {
      return res.send(data);
    }
  });
};

exports.getById = (req, res) => {
  CheckoutModel.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(500).send({
          message: `Checkout dengan id ${req.params.id} tidak ditemukan`,
        });
      } else
        return res.status(500).send({
          message:
            err.message + " on =>" + err.error ||
            "Terjadi error saat create checkout",
        });
    } else {
      return res.send(data);
    }
  });
};
