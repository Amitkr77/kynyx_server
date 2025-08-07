const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware")
const handleCareer = require("../controllers/career.controller");

router.post("/", upload.single("resume"), handleCareer);

module.exports = router;
