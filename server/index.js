//Library
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const express = require("express");
const app = express();

//PORT
const PORT = 8080;

//use Library
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//access route
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

//Create Server
app.listen(PORT, () => {
  console.log(`server listening at http://localhost:${PORT}`);
});
