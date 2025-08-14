const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const handleQuote = require("../controllers/quote.controller");
const validateQuoteInput = require("../middlewares/validateQuoteInput");

router.post("/", upload.single("file"),  handleQuote);

module.exports = router;
