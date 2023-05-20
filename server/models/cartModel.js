const sql = require("../config/database");

// constructor
const Cart = function (cart) {
  this.productid = cart.productid;
  this.quantity = cart.quantity;
  this.created_at = cart.created_at;
  this.modified_at = cart.modified_at;
};

Cart.create = (newCart, result) => {
  //check stock on product by productid
  getStock(newCart, (errHasilStock, hasilstok) => {
    if (errHasilStock) {
      result(errHasilStock, null);
      return;
    }
    if (hasilstok.kind === "not_found") {
      result({ kind: "not_found_product" }, null);
      return;
    }
    if (hasilstok < newCart.quantity) {
      result({ kind: "stok_kurang" }, null);
      return;
    }
    sql.query("INSERT INTO cart SET ?", newCart, (err, res) => {
      if (err) {
        result(err, null);
        return;
      }
      result(null, { id: res.insertId, ...newCart });
    });
  });
};

Cart.getById = (id, result) => {
  sql.query(
    `SELECT cart.id,productid,product.name as name,quantity,product.salesprice AS price FROM cart join product on cart.productid = product.id WHERE cart.id = ${id}`,
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      if (res.length) {
        result(null, res[0]);
        return;
      }

      result({ kind: "not_found" }, null);
    }
  );
};

Cart.getAll = (result) => {
  let query =
    "SELECT cart.id,productid,product.name AS name,product.salesprice AS price,quantity FROM cart JOIN product ON cart.productid = product.id";

  sql.query(query, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Cart.updateById = (id, cart, result) => {
  sql.query(
    "UPDATE cart SET productid = ?, quantity = ?, modified_at = ? WHERE id = ?",
    [cart.productid, cart.quantity, cart.modified_at, id],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, { id: id, ...cart });
    }
  );
};

Cart.delete = (id, result) => {
  sql.query("DELETE FROM cart WHERE id = ?", id, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    result(null, res);
  });
};

Cart.deleteAll = (result) => {
  sql.query("DELETE FROM cart", (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

//add query
const getStock = (param, result) => {
  sql.query(
    "SELECT stock from product where id= ?",
    param.productid,
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }
      if (res.length) {
        result(null, res[0].stock);
        return;
      }
      result(null, { kind: "not_found" });
    }
  );
};

module.exports = Cart;
