const ProductModel = require("../models/productModel");
const Moment = require("moment");

exports.create = (req, res) => {
  // Validate
  if (!req.body) {
    res.status(400).send({
      message: "request tidak boleh kosong!",
    });
  }
  if (!req.body.name) {
    res.status(400).send({
      message: "Name tidak boleh Kosong!",
    });
  }
  if (!req.body.description) {
    res.status(400).send({
      message: "Description tidak boleh kosong!",
    });
  }
  if (!req.body.salesprice) {
    res.status(400).send({
      message: "SalesPrice tidak boleh kosong!",
    });
  }

  if (!Number.isInteger(req.body.salesprice)) {
    res.status(400).send({
      message: "SalesPrice wajib Angka!" + req.body.salesprice,
    });
  }

  //create Product
  const product = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    salesprice: req.body.salesprice,
    created_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  //insert product to database
  ProductModel.create(product, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Terjadi Error saat insert Data Product",
      });
    else
      res.status(200).send({
        message: "Data produk berhasil dibuat",
        create: data,
      });
  });
};

exports.getByid = (req, res) => {
  ProductModel.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Produk tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error get produk dari id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.getAll = (req, res) => {
  const name = req.query.name;

  ProductModel.getAll(name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Terjadi error saat get all data produk",
      });
    else res.send(data);
  });
};

exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Request Tidak Boleh Kosong!",
    });
  }
  if (!req.body.name) {
    res.status(400).send({
      message: "Name tidak boleh Kosong!",
    });
  }
  if (!req.body.description) {
    res.status(400).send({
      message: "Description tidak boleh kosong!",
    });
  }
  if (!req.body.salesprice) {
    res.status(400).send({
      message: "SalesPrice tidak boleh kosong!",
    });
  }
  if (!Number.isInteger(req.body.salesprice)) {
    res.status(400).send({
      message: "SalesPrice wajib Angka!",
    });
  }

  //update Product
  const product = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    salesprice: req.body.salesprice,
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  ProductModel.updateById(req.params.id, product, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Produk tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error Update data produk dari id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.delete = (req, res) => {
  ProductModel.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Produk tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Tidak bisa menghapus produk dari id " + req.params.id,
        });
      }
    } else res.send({ message: `Data Produk Berhasil Dihapus!` });
  });
};
