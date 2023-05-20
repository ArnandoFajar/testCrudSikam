const sql = require("../config/database");

// constructor
const CancelOrder = function (cancelOrder) {
  this.orderid = cancelOrder.orderid;
  this.created_at = cancelOrder.created_at;
  this.modified_at = cancelOrder.modified_at;
};

CancelOrder.create = (newCancelOrder, result) => {
  sql.query(
    "UPDATE orderdetails SET statusorder = 'batal',modified_at = ? WHERE id = ?",
    [newCancelOrder.modified_at, newCancelOrder.orderid],
    (errOrderDetails, resOrderDetails) => {
      if (errOrderDetails) {
        result(errOrderDetails, null);
        return;
      } else {
        if (resOrderDetails.affectedRows === 0) {
          result({ kind: "not_found" }, null);
        } else {
          result(null, { ...newCancelOrder });
        }
      }
    }
  );
};

CancelOrder.getAll = (result) => {
  getOrderDetails(null, (errOrderDetails, resOrderDetails) => {
    if (errOrderDetails) {
      result({ message: errOrderDetails, error: "getOrderDetails" }, null);
      return;
    }
    result(null, resOrderDetails);
  });
};

CancelOrder.getById = (id, result) => {
  getOrderDetails(id, (errOrderDetails, resOrderDetails) => {
    if (errOrderDetails) {
      result({ message: errOrderDetails, error: "getOrderDetails" }, null);
      return;
    }
    getOrderItems(id, (errOrderItems, resOrderItems) => {
      if (errOrderItems) {
        result({ message: errOrderDetails, error: "getOrderItems" }, null);
        return;
      }
      if (resOrderItems.length > 0) {
        result(null, { ...resOrderDetails[0], orderitems: resOrderItems });
        return;
      }
      result({ kind: "not_found" }, null);
    });
  });
};

const getOrderDetails = (id, callback) => {
  if (id === null) {
    sql.query(
      "SELECT orderdetails.id,total,statusorder,amount,statuspayment FROM orderdetails JOIN paymentdetails ON orderdetails.paymentid = paymentdetails.id WHERE statusorder='batal' ORDER BY orderdetails.id ASC",
      (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
        return;
      }
    );
  } else {
    sql.query(
      "SELECT orderdetails.id,total,statusorder,amount,statuspayment FROM orderdetails JOIN paymentdetails ON orderdetails.paymentid = paymentdetails.id WHERE orderdetails.id = ? && statusorder='batal' ORDER BY orderdetails.id ASC",
      id,
      (err, res) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, res);
        return;
      }
    );
  }
};

const getOrderItems = (orderid, callback) => {
  sql.query(
    "SELECT orderitems.id,productid,product.name,quantity,product.salesprice AS price, (product.salesprice * quantity) AS totalprice FROM orderitems JOIN product ON orderitems.productid = product.id JOIN orderdetails ON orderitems.orderid = orderdetails.id WHERE orderid = ? && statusorder='batal' ORDER BY orderitems.id ASC",
    orderid,
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, res);
      return;
    }
  );
};

module.exports = CancelOrder;
