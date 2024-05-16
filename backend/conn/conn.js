// const mongoose = require("mongoose");

// const conn = async(req, res) => {
//   await mongoose
//   .connect(process.env.MONGODBURL)
//   .then( () => {
//     console.log("Connected");
//   })
// };
//  

// conn();
const mongoose = require("mongoose");

const conn = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

conn();
