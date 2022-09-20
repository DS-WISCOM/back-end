const express = require('express');
const router = express.Router();

const { Developer } = require('../models/developer.js');

// DB 저장: /insertData - post
router.post("/insertData", (req, res) =>{
  Developer.insertMany(req.body);
  res.status(200).json({success:true});
} )

// 팀원 전체 불러오기 - get, query

// 팀원 상세 불러오기 - get

module.exports = router;