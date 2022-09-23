const express = require("express");
const router = express.Router();
const upload = require("../upload");

const app = express();

const { Developer } = require("../models/developer.js");
const { Project } = require("../models/project.js");

// DB 저장: /insertData - post
router.post("/developer", (req, res) => {
  Developer.insertMany(req.body);
  res.status(200).json({ success: true });
});

// DB 저장: /insertData - post
router.post("/project", (req, res) => {
  Project.insertMany(req.body);
  res.status(200).json({ success: true });
});

// Image S3에 저장
router.post("/image", upload.single("image"), (req, res) => {
  res.send("good!");
});

module.exports = router;
