const CancelOrderModel = require("../models/cancelOrderModel");
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

  //create Payment
  const cancelOrder = new CancelOrderModel({
    orderid: req.body.orderid,
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  //insert payment to database
  CancelOrderModel.create(cancelOrder, (err, data) => {
    if (err)
      if (err.kind === "not_found") {
        return res.status(400).send({
          message: `checkout dari order id ${req.body.orderid} tidak ditemukan`,
        });
      } else
        return res.status(500).send({
          message: err.message || "Terjadi Error saat insert Data Payment",
        });
    else
      return res.status(200).send({
        message: "Order berhasil dibatalkan",
        data: data,
      });
  });
};

exports.getAll = (req, res) => {
  CancelOrderModel.getAll((err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi error saat get all data produk",
      });
    else return res.send(data);
  });
};

exports.getById = (req, res) => {
  CancelOrderModel.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(500).send({
          message: `Cancel order dengan id ${req.params.id} tidak ditemukan`,
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
