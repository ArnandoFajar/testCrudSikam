const sql = require("../config/database");
const cartModel = require("../models/cartModel");

//constructor
const Checkout = function (checkout) {
  this.productid = checkout.productid;
  this.total = checkout.total;
  this.statusorder = checkout.statusorder;
  this.amount = checkout.amount;
  this.statuspayment = checkout.statuspayment;
  this.orderitems = checkout.orderitems;
  this.created_at = checkout.created_at;
  this.modified_at = checkout.modified_at;
};

/**
 *
 * @param {string} newCheckout
 * @param {object} result
 */

/** Fitur Checkout terdiri dari 3 Tabel yaitu
 * 1. Orderdetail
 * 2. Orderitem
 * 3. Paymentdetail
 *
 * setelah checkout pertama insert paymentdetail dahulu setelah itu
 * insert Orderdetail sesudah itu terahir insert orderitem
 */
Checkout.create = (newCheckout, result) => {
  //insert paymentdetails
  insertPayment(newCheckout, (errPayment, resPayment) => {
    if (errPayment) {
      result(errPayment, null);
    }

    //insert orderdetails
    //push value object
    newCheckout.paymentid = resPayment;
    insertOrderDetail(newCheckout, (errOrderDetail, resOrderDetail) => {
      if (errOrderDetail) {
        result(errOrderDetail, null);
      }

      //insert orderitems
      //push value object
      newCheckout.orderid = resOrderDetail;
      insertOrderItem(newCheckout, (errOrderItems, resOrderItems) => {
        if (errOrderItems) {
          result(errOrderItems, null);
        }
        //delete all Cart
        cartModel.deleteAll();

        //return result
        result(null, { ...newCheckout });
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
      console.log("created paymentdetail: ", { id: res.insertId });
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
      console.log("created paymentdetail: ", { id: res.insertId });
      callback(null, res.insertId);
    }
  );
};

const insertOrderItem = (param, callback) => {
  const items = param.orderitems;

  items.forEach((item, index) => {
    sql.query(
      "INSERT INTO orderitems (orderid,productid,created_at,modified_at) VALUES(?,?,?,?)",
      [param.orderid, item.productid, param.created_at, param.modified_at],
      (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        console.log("created orderitems: ", { id: res.insertId });
      }
    );
  });
  callback(null, true);
};
