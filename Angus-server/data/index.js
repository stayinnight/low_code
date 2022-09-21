const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/Angus")
  .then(() => {
    console.log("connect success");
  })
  .catch((err) => {
    console.log(err);
  });
