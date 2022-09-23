const express = require("express");
const router = express.Router();

const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

const { Project } = require("../models/project.js");
const { Comment } = require("../models/comment.js");

require("dotenv").config({ path: ".env" });

// session
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.mongoURI }), // session 저장 장소 (Mongodb로 설정)
    cookie: { maxAge: 60 * 60 * 24 }, // 24시간 뒤 만료(자동 삭제)
  })
);

// 프로젝트 전체 목록 - get
// query: page, sort
router.get("/total", async (req, res) => {
  try {
    //Pagenation
    const page = Number(req.query.page || 1); //1: default (1~8)
    const perPage = 8;
    const sort = Number(req.query.sort || 1); //1: defalut 이름순, 2: 인기순

    const projects = await Project.find({})
      .sort(sort == 1 ? { name: 1 } : { likes: 1 }) //-1: desc, 1: asc
      .skip(perPage * (page - 1)) //검색 시 포함하지 않을 데이터 수
      .limit(perPage);

    res.status(200).json({ success: true, projects });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, message: "Failed to load project list", err });
  }
});

// 프로젝트 상세 - get
// query: page
router.get("/:projectId", async (req, res) => {
  const projectId = mongoose.Types.ObjectId(req.params.projectId);

  //findOne : 하나의 문서 찾기
  Project.findOne({ _id: projectId })
    .then(async (projects) => {
      const page = Number(req.query.page || 1); // page : 현재페이지  //값x -> 기본값으로 1  //query는 문자열로 전달해서 Number로 형변환
      const perPage = 3; // 댓글 3개 보여줌

      const comments = await Comment.find({ project_id: projectId }) //await 비동기 처리되는 부분 앞에 
        .sort({ createdAt: -1 })  // 최근순으로 정렬
        .skip(perPage * (page - 1)) //검색 시 포함하지 않을 데이터 수
        .limit(perPage); //검색 결과 수 제한

      res.json({ comments, projects });  //처리되면 projects를 출력
    })
    .catch((err) => {
      return res
        .status(200)
        .json({ success: false, message: "Failed to load detail", err });
    });
});

// 좋아요 등록 - post
router.post("/:projectId/addLike", async (req, res, next) => {
  const projectId = req.params.projectId;

  // Version1. Session 사용.
  // 장점: 한 번 접속할 때 좋아요를 마구 누룰 수 없다.
  // 단점: 세션을 파일로든 db에든 저장해야한다.
  try {
    // 아직 한 번도 좋아요를 누른적 없을 때
    if (!req.session.projectId) {
      // 세션에 배열 생성
      req.session.projectId = [projectId];

      // 좋아요 +1
      await Project.findOneAndUpdate(
        { _id: projectId },
        { $inc: { likes: 1 } }
      );
      // p = await Project.findOneAndUpdate({ _id: mongoose.Types.ObjectId(projectId) }, { $inc: { likes: 1 } }, { new: true });
    } else {
      // 좋아요를 누른 적 있을 때
      let project_arr = req.session.projectId;
      let flag = true;

      // 현 projectId가 있는지 확인
      for (let i = 0; i < project_arr.length; i++) {
        if (project_arr[i] === projectId) {
          flag = false;
          break;
        }
      }
      // 현 projectId가 없다면 추가
      if (flag) {
        req.session.projectId.push(projectId);

        // 좋아요 +1
        await Project.findOneAndUpdate(
          { _id: projectId },
          { $inc: { likes: 1 } }
        );
      }
    }
    return res
      .status(200)
      .json({ success: true, message: "Success in adding likes" });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, message: "failed to adding likes", err });
  }

  // Version 2. 변수로 처리.
  // 장점: 간단하다. 단점: 새로고침하면 좋아요를 다시 누를 수 있다.
  // 프론트에 alreadyLiked를 보내서 같이 관리해야 할 듯 합니다?
  // let alreadyLiked = false;
  // try {
  //     if (!alreadyLiked) {
  //       // 좋아요 +1
  //       await Project.findOneAndUpdate({ _id: mongoose.Types.ObjectId(projectId) }, { $inc: { likes: 1 } });
  //       flag = false;
  //       return res.status(200).json({ success: true, alreadyLiked: alreadyLiked });
  //     }
  //     else {
  //       return res.status(200).json({ success: false, alreadyLiked: alreadyLiked });  // alreadyLike 추가?
  //     }
  //   } catch(err) {
  //       console.log(err);
  //       return res.status(200).json({ success: false });
  //   }
});

// 댓글 등록 - post
router.post("/:projectId/addComment", (req, res) => {
  const comment = new Comment(req.body);
  const projectId = mongoose.Types.ObjectId(req.params.projectId);

  comment.project_id = projectId;

  //updateOne : 데이터 수정 함수
  Project.updateOne({ _id: projectId }, { $push: { comments: comment._id } })  //$push : 배열이 이미 존재하면 배열 끝에 요소를 추가, 존재하지 않으면 새로운 배열을 생성
    .then((comments) => {
      comment.save((err, commentInfo) => {
        if (err) {
          return res
            .status(200)
            .json({ success: false, message: "Failed to add comment", err });
        } else if (commentInfo !== null)
          return res.status(200).json({
            success: true,
            message: "Comment successful",
            commentInfo,
          });
      });
    })
    .catch((err) => {
      res.status(200).json({
        success: false,
        message: "Failed to Add commentID to Project document",
        err,
      });
    });
});

module.exports = router;
