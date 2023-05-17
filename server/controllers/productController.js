const ProductModel = require("../models/productModel");
const Moment = require("moment");

exports.create = (req, res) => {
  // Validate
  if (!req.body) {
    return res.status(400).send({
      message: "request tidak boleh kosong!",
    });
  }
  if (!req.body.name) {
    return res.status(400).send({
      message: "Name tidak boleh Kosong!",
    });
  }
  if (!req.body.description) {
    return res.status(400).send({
      message: "Description tidak boleh kosong!",
    });
  }

  if (!req.body.stock) {
    return res.status(400).send({
      message: "Stock tidak boleh kosong!",
    });
  }

  if (!Number.isInteger(req.body.stock)) {
    return res.status(400).send({
      message: "stock wajib Angka!",
    });
  }

  if (!req.body.salesprice) {
    return res.status(400).send({
      message: "SalesPrice tidak boleh kosong!",
    });
  }

  if (!Number.isInteger(req.body.salesprice)) {
    return res.status(400).send({
      message: "SalesPrice wajib Angka!",
    });
  }

  //create Product
  const product = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    salesprice: req.body.salesprice,
    stock: req.body.stock,
    created_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  //insert product to database
  ProductModel.create(product, (err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi Error saat insert Data Product",
      });
    else
      return res.status(200).send({
        message: "Data produk berhasil dibuat",
        data: data,
      });
  });
};

exports.getByid = (req, res) => {
  ProductModel.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Produk tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        return res.status(500).send({
          message: "Error get produk dari id " + req.params.id,
        });
      }
    } else return res.send(data);
  });
};

exports.getAll = (req, res) => {
  const name = req.query.name;

  ProductModel.getAll(name, (err, data) => {
    if (err)
      return res.status(500).send({
        message: err.message || "Terjadi error saat get all data produk",
      });
    else return res.send(data);
  });
};

exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    return res.status(400).send({
      message: "Request Tidak Boleh Kosong!",
    });
  }
  if (!req.body.name) {
    return res.status(400).send({
      message: "Name tidak boleh Kosong!",
    });
  }
  if (!req.body.description) {
    return res.status(400).send({
      message: "Description tidak boleh kosong!",
    });
  }
  if (!req.body.stock) {
    return res.status(400).send({
      message: "Stock tidak boleh kosong!",
    });
  }
  if (!Number.isInteger(req.body.stock)) {
    return res.status(400).send({
      message: "Stock wajib Angka!",
    });
  }
  if (!req.body.salesprice) {
    return res.status(400).send({
      message: "SalesPrice tidak boleh kosong!",
    });
  }
  if (!Number.isInteger(req.body.salesprice)) {
    return res.status(400).send({
      message: "SalesPrice wajib Angka!",
    });
  }

  //update Product
  const product = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    salesprice: req.body.salesprice,
    stock: req.body.stock,
    modified_at: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  });

  ProductModel.updateById(req.params.id, product, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Produk tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        return res.status(500).send({
          message: "Error Update data produk dari id " + req.params.id,
        });
      }
    } else return res.send({ message: "Data berhasil diubah", data: data });
  });
};

exports.delete = (req, res) => {
  ProductModel.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({
          message: `Produk tidak ditemukan dari id ${req.params.id}.`,
        });
      } else {
        return res.status(500).send({
          message: "Tidak bisa menghapus produk dari id " + req.params.id,
        });
      }
    } else return res.send({ message: `Data Produk Berhasil Dihapus!` });
  });
};
