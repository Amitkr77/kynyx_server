const express = require("express");
const multer = require("multer");
const router = express.Router();
const handleQuote = require("../controllers/quote.controller");
const validateQuoteInput = require("../middlewares/validateQuoteInput");

const upload = multer({ dest: "uploads/" });
router.post("/", upload.single("file"),  handleQuote);

module.exports = router;
