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

  if (!req.body.statusorder) {
    return res.status(400).send({
      message: "status Order tidak boleh kosong!",
    });
  }

  if (!req.body.statuspayment) {
    return res.status(400).send({
      message: "status payment tidak boleh kosong!",
    });
  }

  CheckoutModel.create((err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || "Terjadi error saat create checkout",
      });
    } else return res.send(data);
  });
};
