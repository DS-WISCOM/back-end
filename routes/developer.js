const express = require("express");
const router = express.Router();

const { Developer } = require("../models/developer.js");

// 팀원 전체 불러오기 - get, query
router.get("/total", async (req, res) => {
  try {
    const developers = await Developer.find({})
      .sort({ name_kr: 1 })

    res.status(200).json({ success: true, DeveloperList: developers });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, message: "Failed to load developer list", err });
  }
});

// 팀원 상세 불러오기 - get
router.get("/:developerId", async (req, res) => {
  const developerId = req.params.developerId;
  try {
    const developer = await Developer.find({ developer_id: developerId });
    res.json({ success: true, developer: developer });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Failed to load developer detail",
      err,
    });
  }
});

module.exports = router;
