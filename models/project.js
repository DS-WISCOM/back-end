const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = mongoose.Schema({
  name: {
    // 프로젝트명
    type: String,
  },
  introduce: {
    // 프로젝트 소개
    type: String,
  },
  team_name: {
    // 팀명
    type: String,
  },
  img: {
    // 프로젝트 사진 경로
    type: String,
  },
  ppt: [
    {
      // 최종 ppt 이미지화 경로
      type: String,
    },
  ],
  developers: [
    {
      // 팀원
      type: String,
      require: true,
    },
  ],
  video: {
    // 유튜브 링크
    type: String,
  },
  likes: {
    // 좋아요 수
    type: Number,
  },
  comments: [
    {
      // 댓글 목록
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Project = mongoose.model("Project", projectSchema);

module.exports = { Project };
