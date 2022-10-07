const express = require("express");
const router = express.Router();

const { Developer } = require("../models/developer.js");

// 팀원 이름 전체 불러오기 - get
router.get("/totalName", async (req, res) => {
  try {
    const nameList = [];
    const developers = await Developer.find({}, { _id: 0, name_kr: 1 }).sort({
      name_kr: 1,
    });
    for (let i = 0; i < developers.length; i++) {
      nameList.push(developers[i].nameList.name_kr);
    }
    console.log(nameList);
    res.status(200).json({ success: true, nameList: nameList });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, message: "Failed to load developer list", err });
  }
});

// 팀원 전체 불러오기 - get, query
router.get("/total", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const perPage = 8;
    const developers = await Developer.find({})
      .populate({
        path: "project_id",
        model: "Project",
        select: ["name"],
      })
      .sort({ name_kr: 1 })
      .skip(perPage * (page - 1)) //검색 시 포함하지 않을 데이터 수
      .limit(perPage); //한 페이지 최대 팀원 수
    
    // 마지막 페이지인지 알려주는 isLast
    let isLast = false;
    const totalCount = await Developer.countDocuments({});
    if (totalCount % perPage == 0) {
      if (page == parseInt(totalCount/perPage)) {
        isLast = true;
      }
    }
    else if (page == parseInt(totalCount/perPage) + 1) {
      isLast = true;
    }
    
    res.status(200).json({ success: true, DeveloperList: developers , isLast: isLast });
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
    const developer = await Developer.find({
      developer_id: developerId,
    }).populate({
      path: "project_id",
      model: "Project",
      select: ["name", "img"],
    });
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
