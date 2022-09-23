const express = require("express");
const router = express.Router();

const { Developer } = require("../models/developer.js");

// 팀원 전체 불러오기 - get, query
router.get("/total", async (req, res) => {
    try {
    const page = Number(req.query.page || 1);
    const perPage = 8;
    const developers = await Developer.find({})
        .skip(perPage * (page - 1)) //검색 시 포함하지 않을 데이터 수
        .limit(perPage); //한 페이지 최대 팀원 수
        res.status(200).json({ success: true, DeveloperList: developers });
    } catch (err) {
        return res
        .status(200)
        .json({ success: false, message: "Failed", err });
    }
});

// 팀원 상세 불러오기 - get
router.get("/:memberId", async (req, res) => {
    const memberId = req.params.memberId;
    const memdetail = await Developer.find({ developer_id: memberId});
    try{
        res.json({ success: true, MemberDetail: memdetail });
    } catch (err) {
        return res
        .status(200)
        .json({ success: false, message: "failed", err });
    }
    
});

module.exports = router;
