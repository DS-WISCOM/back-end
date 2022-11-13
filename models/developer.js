const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const developerSchema = mongoose.Schema({
  name_kr: {
    // 한글 이름
    type: String,
  },
  name_eng: {
    // 영어 이름
    type: String,
  },
  developer_id: {
    // 개발자 id(학번)
    type: String,
  },
  project_id: {
    // 프로젝트 id(FK)
    type: Schema.Types.ObjectId,
    ref: "Project",
    require: true,
  },
  email: {
    // 개발자 이메일
    type: String,
    trim: true,
    unique: 1,
  },
  img: {
    // 개발자 프로필 경로
    type: String,
  },
  impression: {
    // 마무리 소감
    type: String,
  },
  role: {
    // 역할
    type: String,
  },
});

const Developer = mongoose.model("Developer", developerSchema);

module.exports = { Developer };
