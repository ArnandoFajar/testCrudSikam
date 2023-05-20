const sql = require("../config/database");
const amqp = require("amqplib/callback_api");

//constructor
const Checkout = function (checkout) {
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
  amqp.connect("amqp://localhost", (err, connection) => {
    if (err) {
      result({ message: err, error: "connection" }, null);
      return;
    }

    connection.createChannel((err, channel) => {
      if (err) {
        result({ message: err, error: "channel" }, null);
        return;
      }

      const queue = "checkout_queue";

      // Start transaction
      sql.beginTransaction((errTransaction) => {
        if (errTransaction) {
          result({ message: errTransaction, error: "transaction" }, null);
          return;
        }

        // Insert paymentdetails
        insertPayment(newCheckout, (errPayment, resPayment) => {
          if (errPayment) {
            result({ message: errPayment, error: "insertpayment" }, null);
            sql.rollback();
            return;
          }

          // Insert orderdetails
          // Push value object
          newCheckout.paymentid = resPayment;
          insertOrderDetail(newCheckout, (errOrderDetail, resOrderDetail) => {
            if (errOrderDetail) {
              result(
                { message: errOrderDetail, error: "insertorderdetails" },
                null
              );
              sql.rollback();
              return;
            }

            // Insert orderitems
            // Push value object
            newCheckout.orderid = resOrderDetail;
            insertOrderItem(newCheckout, (errOrderItems, resOrderItems) => {
              if (errOrderItems) {
                result(
                  { message: errOrderItems, error: "insertorderitem" },
                  null
                );
                sql.rollback();
                return;
              }

              // Reduce stock
              reduceStock(newCheckout, (errReduceStock, resReduceItems) => {
                if (errReduceStock) {
                  result(errReduceStock, null);
                  sql.rollback();
                  return;
                }

                // Delete all Cart
                deleteAllCart((errDeleteCart, resDeleteCart) => {
                  if (errDeleteCart) {
                    result(
                      { message: errDeleteCart, error: "deleteCart" },
                      null
                    );
                    sql.rollback();
                    return;
                  }

                  // Commit transaction
                  sql.commit((errCommit) => {
                    if (errCommit) {
                      result({ message: errCommit, error: "commit" }, null);
                      sql.rollback();
                      return;
                    }

                    const checkoutData = { ...newCheckout };
                    channel.assertQueue(queue, { durable: true });
                    channel.sendToQueue(
                      queue,
                      Buffer.from(JSON.stringify(checkoutData)),
                      {
                        persistent: true,
                      }
                    );

                    result(null, checkoutData);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

Checkout.getById = (id, result) => {
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

Checkout.getAll = (result) => {
  getOrderDetails(null, (errOrderDetails, resOrderDetails) => {
    if (errOrderDetails) {
      result({ message: errOrderDetails, error: "getOrderDetails" }, null);
      return;
    }
    result(null, resOrderDetails);
  });
};

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
    "INSERT INTO orderdetails (total,statusorder,paymentid,created_at,modified_at) VALUES(?,?,?,?,?)",
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
      "INSERT INTO orderitems (orderid,productid,quantity,created_at,modified_at) VALUES(?,?,?,?,?)",
      [
        param.orderid,
        item.productid,
        item.quantity,
        param.created_at,
        param.modified_at,
      ],
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
    "SELECT IFNULL(SUM(salesprice * quantity),0) AS totalprice FROM cart JOIN product ON cart.productid = product.id",
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      if (res.length) {
        callback(null, res[0].totalprice);
        return;
      } else {
        callback(null, 0);
      }
    }
  );
};

const reduceStock = async (param, callback) => {
  const items = param.cart;

  try {
    for (let i = 0; i < items.length; i++) {
      let stockakhir = await getStock(items[i].productid);
      stockakhir -= items[i].quantity;

      if (stockakhir <= 0) {
        throw new Error(`Stok kurang - ${items[i].productid}`);
      }

      await updateStock(items[i].productid, stockakhir);
    }

    callback(null, true);
  } catch (error) {
    if (error.message.startsWith("Stok kurang")) {
      const productid = error.message.split("-")[1].trim();
      const productname = await getProductName(productid);
      callback({ kind: "stok_kurang", productname }, null);
    } else {
      callback(error, null);
    }
  }
};

const getStock = (productid) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT stock FROM product WHERE id = ?",
      productid,
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res[0].stock);
        }
      }
    );
  });
};

const updateStock = (productid, stockakhir) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "UPDATE product SET stock = ? WHERE id = ?",
      [stockakhir, productid],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (res.affectedRows === 0) {
            reject({ kind: "not_found" });
          } else {
            resolve();
          }
        }
      }
    );
  });
};

const getProductName = (productid) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT name FROM product WHERE id = ?",
      productid,
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res[0].name);
        }
      }
    );
  });
};

const getOrderDetails = (id, callback) => {
  if (id === null) {
    sql.query(
      "SELECT orderdetails.id,total,statusorder,amount,statuspayment FROM orderdetails JOIN paymentdetails ON orderdetails.paymentid = paymentdetails.id WHERE statusorder='menunggupembayaran' ORDER BY orderdetails.id ASC",
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
      "SELECT orderdetails.id,total,statusorder,amount,statuspayment FROM orderdetails JOIN paymentdetails ON orderdetails.paymentid = paymentdetails.id WHERE orderdetails.id = ? ORDER BY orderdetails.id ASC",
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
    "SELECT orderitems.id,productid,product.name,quantity,product.salesprice AS price, (product.salesprice * quantity) AS totalprice FROM orderitems JOIN product ON orderitems.productid = product.id WHERE orderid = ? ORDER BY orderitems.id ASC",
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

const deletePayment = (id, callback) => {
  sql.query("DELETE FROM paymentdetails WHERE id = ?", id, (err, res) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, true);
    return;
  });
};

const deleteOrderItems = (orderid, callback) => {
  sql.query("DELETE FROM orderitems WHERE orderid = ?", orderid, (err, res) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, true);
    return;
  });
};

const deleteAllCart = (callback) => {
  sql.query("DELETE FROM cart", (err, res) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, res);
  });
};
module.exports = Checkout;
