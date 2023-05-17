const sql = require("../config/database");

// constructor
const Cart = function (cart) {
  this.productid = cart.productid;
  this.quantity = cart.quantity;
  this.created_at = cart.created_at;
  this.modified_at = cart.modified_at;
};

Cart.create = (newCart, result) => {
  sql.query("INSERT INTO product SET ?", newCart, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created cart: ", { id: res.insertId, ...newCart });
    result(null, { id: res.insertId, ...newCart });
  });
};

Cart.getById = (id, result) => {
  sql.query(
    `SELECT id,productid,product.name as name,quantity FROM cart join product on cart.productid = product.id WHERE cart.id = ${id}`,
    (err, res) => {
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
    }
  );
};

Cart.getAll = (result) => {
  let query =
    "SELECT id,productid,product.name AS name,quantity FROM cart JOIN product ON cart.productid = product.id";

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("cart: ", res);
    result(null, res);
  });
};

Cart.updateById = (id, cart, result) => {
  sql.query(
    "UPDATE cart SET productid = ?, quantity = ?, modified_at = ? WHERE id = ?",
    [cart.productid, cart.quantity, cart.modified_at, id],
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

      console.log("Cart Updated: ", { id: id, ...cart });
      result(null, { id: id, ...cart });
    }
  );
};

Cart.delete = (id, result) => {
  sql.query("DELETE FROM cart WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Hapus Cart by id: ", id);
    result(null, res);
  });
};

Cart.deleteAll = (result) => {
  sql.query("DELETE FROM cart", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`deleted ${res.affectedRows} Cart`);
    result(null, res);
  });
};

module.exports = Cart;
