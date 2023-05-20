const sql = require("../config/database");

// constructor
const Payment = function (payment) {
  this.orderid = payment.orderid;
  this.amount = payment.amount;
  this.created_at = payment.created_at;
  this.modified_at = payment.modified_at;
};

Payment.create = (newPayment, result) => {
  //get total
  getTotalOrderDetails(
    newPayment,
    (errTotalOrderDetails, resTotalOrderDetails) => {
      if (errTotalOrderDetails) {
        result(errTotalOrderDetails, null);
        return;
      }
      if (newPayment.amount != resTotalOrderDetails.total) {
        result({ kind: "beda_total" }, null);
        return;
      } else {
        sql.query(
          "UPDATE orderdetails SET statusorder = 'selesai',modified_at = ? WHERE id = ?",
          [newPayment.modified_at, newPayment.orderid],
          (errOrderDetails, resOrderDetails) => {
            if (errOrderDetails) {
              result(errOrderDetails, null);
              return;
            }
            sql.query(
              "UPDATE paymentdetails SET statuspayment = 'sudahbayar',modified_at = ? WHERE id = ?",
              [newPayment.modified_at, resTotalOrderDetails.paymentid],
              (errPaymentDetails, resPaymentDetails) => {
                if (errPaymentDetails) {
                  result(errPaymentDetails, null);
                  return;
                } else {
                  result(null, { ...newPayment });
                  return;
                }
              }
            );
          }
        );
      }
    }
  );
};

Payment.getAll = (result) => {
  getOrderDetails(null, (errOrderDetails, resOrderDetails) => {
    if (errOrderDetails) {
      result({ message: errOrderDetails, error: "getOrderDetails" }, null);
      return;
    }
    result(null, resOrderDetails);
  });
};

Payment.getById = (id, result) => {
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

const getTotalOrderDetails = (param, callback) => {
  sql.query(
    "SELECT total,paymentid FROM orderdetails WHERE id = ?",
    param.orderid,
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      if (res.length > 0) {
        callback(null, res[0]);
        return;
      } else {
        callback({ kind: "not_found" }, null);
      }
    }
  );
};

const getOrderDetails = (id, callback) => {
  if (id === null) {
    sql.query(
      "SELECT orderdetails.id,total,statusorder,amount,statuspayment FROM orderdetails JOIN paymentdetails ON orderdetails.paymentid = paymentdetails.id WHERE statusorder='selesai' ORDER BY orderdetails.id ASC",
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
      "SELECT orderdetails.id,total,statusorder,amount,statuspayment FROM orderdetails JOIN paymentdetails ON orderdetails.paymentid = paymentdetails.id WHERE orderdetails.id = ? && statusorder='selesai' ORDER BY orderdetails.id ASC",
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
    "SELECT orderitems.id,productid,product.name,quantity,product.salesprice AS price, (product.salesprice * quantity) AS totalprice FROM orderitems JOIN product ON orderitems.productid = product.id JOIN orderdetails ON orderitems.orderid = orderdetails.id WHERE orderid = ? && statusorder='selesai' ORDER BY orderitems.id ASC",
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

module.exports = Payment;
