const express = require('express');
const router = express.Router();

const { Developer } = require('../models/developer.js');
const { Project } = require('../models/project.js');

// DB 저장: /insertData - post
router.post("/developer", (req, res) =>{
  Developer.insertMany(req.body);
  res.status(200).json({success:true});
} )

// DB 저장: /insertData - post
router.post("/project", (req, res) =>{
  Project.insertMany(req.body);
  res.status(200).json({success:true});
} )

module.exports = router;