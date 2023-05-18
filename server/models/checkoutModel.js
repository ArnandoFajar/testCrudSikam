const sql = require("../config/database");
const cartModel = require("../models/cartModel");

//constructor
const Checkout = function (checkout) {
  this.productid = checkout.productid;
  this.total = checkout.total;
  this.statusorder = checkout.statusorder;
  this.amount = checkout.total;
  this.statuspayment = checkout.statuspayment;
  this.cart = checkout.cart;
  this.created_at = checkout.created_at;
  this.modified_at = checkout.modified_at;
};

/**
 * Melihat detail Cart beserta totalnya
 */
Checkout.detailCart = (result) => {
  totalPriceCart((errTotalPrice, resTotalPrice) => {
    if (errTotalPrice) {
      result(err, null);
      return;
    }
    let query =
      "SELECT cart.id,productid,product.name AS name,product.salesprice AS price,quantity,(product.salesprice * quantity) AS totalprice FROM cart JOIN product ON cart.productid = product.id ORDER BY cart.id ASC";

    sql.query(query, (err, res) => {
      if (err) {
        result(err, null);
        return;
      }
      result(null, { total: resTotalPrice, cart: res });
    });
  });
};

/** Fitur Checkout terdiri dari 3 Tabel yang akan di insert yaitu
 * 1. Orderdetail
 * 2. Orderitem
 * 3. Paymentdetail
 *
 * setelah checkout pertama insert paymentdetail dahulu setelah itu
 * insert Orderdetail sesudah itu terahir insert orderitem
 * setelah melakukan insert. stock di tabel product dikurangi
 * lalu truncate tabel Cart
 */
Checkout.create = (newCheckout, result) => {
  //insert paymentdetails
  insertPayment(newCheckout, (errPayment, resPayment) => {
    if (errPayment) {
      result(errPayment, null);
      return;
    }

    //insert orderdetails
    //push value object
    newCheckout.paymentid = resPayment;
    insertOrderDetail(newCheckout, (errOrderDetail, resOrderDetail) => {
      if (errOrderDetail) {
        result(errOrderDetail, null);
        return;
      }

      //insert orderitems
      //push value object
      newCheckout.orderid = resOrderDetail;
      insertOrderItem(newCheckout, (errOrderItems, resOrderItems) => {
        if (errOrderItems) {
          result(errOrderItems, null);
          return;
        }

        //reduce stock
        reduceStock(newCheckout, (errReduceStock, resReduceItems) => {
          if (errReduceStock) {
            result(errReduceStock, null);
            return;
          }
          //delete all Cart
          cartModel.deleteAll();

          //return result
          result(null, { ...newCheckout });
        });
      });
    });
  });
};

Checkout.getById = (id, result) => {};

Checkout.getAll = (name, result) => {};

Checkout.updatedById = (id, checkout, result) => {};

Checkout.delete = (id, result) => {};

const insertPayment = (param, callback) => {
  sql.query(
    "INSERT INTO paymentdetails (amount,statuspayment,created_at, modified_at) VALUES(?,?,?,?)",
    [param.amount, param.statuspayment, param.created_at, param.modified_at],
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, res.insertId);
    }
  );
};

const insertOrderDetail = (param, callback) => {
  sql.query(
    "INSERT INTO orderdetails (total,statusorder,paymentid,created_at,modified_at) VALUES(?,?,?,?)",
    [
      param.total,
      param.statusorder,
      param.paymentid,
      param.created_at,
      param.modified_at,
    ],
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, res.insertId);
    }
  );
};

const insertOrderItem = (param, callback) => {
  const items = param.cart;

  items.forEach((item, index) => {
    sql.query(
      "INSERT INTO orderitems (orderid,productid,created_at,modified_at) VALUES(?,?,?,?)",
      [param.orderid, item.productid, param.created_at, param.modified_at],
      (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
      }
    );
  });
  callback(null, true);
};

const totalPriceCart = (callback) => {
  sql.query(
    "SELECT SUM(salesprice * quantity) AS totalprice FROM cart JOIN product ON cart.productid = product.id",
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      if (res.length) {
        callback(null, res[0].totalprice);
        return;
      }
      callback(null, 0);
    }
  );
};

const reduceStock = (param, callback) => {
  const items = param.cart;

  items.forEach((item, index) => {
    let stockakhir = 0;
    //check stok di tabel product
    sql.query(
      "SELECT stock FROM product WHERE id = ?",
      item.productid,
      (errStock, resStock) => {
        if (errStock) {
          callback(err, null);
          return;
        }
        //menghitung sisa stock
        stockakhir = resStock[0].stock - item.quantity;

        //update stock
        sql.query(
          "UPDATE product SET stock = ? WHERE id = ?",
          [stockakhir, item.productid],
          (err, res) => {
            if (err) {
              callback(err, null);
              return;
            }

            if (res.affectedRows == 0) {
              callback({ kind: "not_found" }, null);
              return;
            }

            callback(null, true);
          }
        );
      }
    );
  });
  callback(null, true);
};

module.exports = Checkout;
