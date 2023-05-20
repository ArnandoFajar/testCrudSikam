const e = require("express");
const PaymentModel = require("../models/paymentModel");
const Moment = require("moment");

exports.create = (req, res) => {
  // Validate
  if (!req.body) {
    return res.status(400).send({
      message: "request tidak boleh kosong!",
    });
  }
  if (!req.body.orderid) {
    return res.status(400).send({
      message: "Orderid tidak boleh Kosong!",
    });
  }
  if (!req.body.amount) {
    return res.status(400).send({
      message: "amount tidak boleh kosong!",
    });
  }
  if (!Number.isInteger(req.body.amount)) {
    return res.status(400).send({
      message: "amount wajib Angka!",
    });
  }

  //create Payment
  const payment = new PaymentModel({
    orderid: req.body.orderid,
    amount: req.body.amount,
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  //insert payment to database
  PaymentModel.create(payment, (err, data) => {
    if (err)
      if (err.kind === "not_found") {
        return res.status(400).send({
          message: `checkout dari order id ${req.body.orderid} tidak ditemukan`,
        });
      } else if (err.kind === "beda_total") {
        return res.status(400).send({
          message: `Jumlah amount dengan total harga checkout harus sama`,
        });
      } else
        return res.status(500).send({
          message: err.message || "Terjadi Error saat insert Data Payment",
        });
    else
      return res.status(200).send({
        message: "Data Payment berhasil dibuat",
        data: data,
      });
  });
};

exports.getAll = (req, res) => {
  PaymentModel.getAll((err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi error saat get all data produk",
      });
    else return res.send(data);
  });
};

exports.getById = (req, res) => {
  PaymentModel.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(500).send({
          message: `Payment dengan id ${req.params.id} tidak ditemukan`,
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
