const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config();
require("./conn/conn");
const auth = require("./routes/auth");
const listRoutes = require("./routes/list");

app.use(express.json());
app.use(
  cors({
    origin: "*", // Allows requests from all origins
    credentials: true, // Allows cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization","Origin"], // Allowed HTTP headers
    preflightContinue: true, // Moves the request to the next middleware if the preflight request is successful
  })
);
// Setup CORS headers for all responses
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // Allows all origins
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept",
//     "Access-Control-Allow-Credentials"
//   );
//   next();
// });



app.use("/api/v1",auth);
app.use("/api/v2", listRoutes);

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});