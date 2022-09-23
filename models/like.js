const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 보류
const likeSchema = mongoose.Schema({
  project_id: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    require: true,
  },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = { Like };
