const express = require('express');
const router = express.Router();

const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');

const { Project } = require('../models/project.js');
const { Comment } = require('../models/comment.js');
const { default: mongoose } = require('mongoose');

require("dotenv").config({ path: ".env" });

// session
router.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.mongoURI }), // session 저장 장소 (Mongodb로 설정)
  cookie: { maxAge: 60*60*24 }      // 24시간 뒤 만료(자동 삭제)
}));


// 프로젝트 전체 목록 - get, query
router.get('/total', async (req, res) => {
    try {
        //Pagenation
        const page = Number(req.query.page || 1); //1: default (1~8)
        const perPage = 8;
        const sort = Number(req.query.sort || 1); //1: defalut 이름순, 2: 인기순
        
        const projects = await Project.find({}) 
            .sort( sort == 1 ? { name : 1 } : { likes : 1 }) //-1: desc, 1: asc
            .skip(perPage * (page - 1)) //검색 시 포함하지 않을 데이터 수
            .limit(perPage);

        console.log(projects);
        res.json(projects);
      } catch (err) {
        console.error(err);
      }
})

// 프로젝트 상세 - get
router.get('/:projectId',async(req,res)=>{
  const projectId = mongoose.Types.ObjectId(req.params.projectId);
  Project.findOne({"_id":projectId},
  )
  .then(async projects=>{
    const comment = Number(req.query.comment || 1); //1: default (1~8)
    const perComment = Number(req.query.perComment || 3);
    const total = await Comment.countDocuments({project_id:projectId});
    console.log(projects);
    const result = await Comment.find({project_id:projectId}) 
      .sort( {createdAt:-1})
      .skip(perComment * (comment - 1)) //검색 시 포함하지 않을 데이터 수
      .limit(perComment);
    const totalPage = Math.ceil(total / perComment);
    console.log(total);
    res.json({result,projects});
}).catch(err=>{
  console.error(err);
})
})



// 좋아요 등록 - post
router.post('/:projectId/addLike', async(req, res, next) => {
  const projectId = req.params.projectId;

  // Version1. Session 사용. 
  // 장점: 한 번 접속할 때 좋아요를 마구 누룰 수 없다.
  // 단점: 세션을 파일로든 db에든 저장해야한다.
  try {
      // 아직 한 번도 좋아요를 누른적 없을 때
      if (!req.session.projectId) {
        // 세션에 배열 생성
        req.session.projectId = [ projectId ];

        // 좋아요 +1
        await Project.findOneAndUpdate({ _id: projectId }, { $inc: { likes: 1 } });
        // p = await Project.findOneAndUpdate({ _id: mongoose.Types.ObjectId(projectId) }, { $inc: { likes: 1 } }, { new: true });
      } 
      else { // 좋아요를 누른 적 있을 때
        let project_arr = req.session.projectId;
        let flag = true;

        // 현 projectId가 있는지 확인
        for (let i = 0; i < project_arr.length ; i++) {
          if (project_arr[i] === projectId) {
              flag = false;
              break;
          }
        }
        // 현 projectId가 없다면 추가
        if (flag) {
          req.session.projectId.push(projectId);
          
          // 좋아요 +1
          await Project.findOneAndUpdate({ _id: projectId }, { $inc: { likes: 1 } });
        }
      }
      return res.status(200).json({ success: true });
  } catch(err) {
      console.log(err);
      return res.status(200).json({ success: false });
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
router.post('/:projectId/addComment',(req, res) => {
  const comment=new Comment(req.body);
  const projectId = mongoose.Types.ObjectId(req.params.projectId);
  comment.project_id=projectId;
  Project.updateOne({"_id":projectId},
  {
    $set:{
      comments:
        comment._id
    }
  }).then(comments=>{
    res.status(200).json({sucess:true, comments});
  }).catch(error=>{
    res.status(400).json({error:error});
  })

  comment.save((err, userInfo)=>{ 
    if(!req.body){return res.status(400).json({
      status:'error',
      error:'empty'});}
});
});


module.exports = router;