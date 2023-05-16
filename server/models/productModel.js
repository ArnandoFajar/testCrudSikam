const sql = require("../config/database");

// constructor
const Product = function (product) {
  this.name = product.name;
  this.description = product.description;
  this.salesprice = product.salesprice;
  this.created_at = product.created_at;
  this.modified_at = product.modified_at;
};

Product.create = (newProduct, result) => {
  sql.query("INSERT INTO product SET ?", newProduct, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created produk: ", { id: res.insertId, ...newProduct });
    result(null, { id: res.insertId, ...newProduct });
  });
};

Product.getById = (id, result) => {
  sql.query(`SELECT * FROM product WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("ditemukan: ", res[0]);
      result(null, res[0]);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

Product.getAll = (name, result) => {
  let query = "SELECT id,name,description,salesprice FROM product";

  if (name) {
    query += ` WHERE name LIKE '%${name}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("produk: ", res);
    result(null, res);
  });
};

Product.updateById = (id, product, result) => {
  sql.query(
    "UPDATE product SET name = ?, description = ?, salesprice = ?, modified_at = ? WHERE id = ?",
    [
      product.title,
      product.description,
      product.salesprice,
      product.modified_at,
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("Produk Updated: ", { id: id, ...product });
      result(null, { id: id, ...product });
    }
  );
};

Product.delete = (id, result) => {
  sql.query("DELETE FROM product WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Hapus produk by id: ", id);
    result(null, res);
  });
};

module.exports = Product;
