const express = require("express");
const router = express.Router();
const handleQuote = require("../controllers/quote.controller");
const validateQuoteInput = require("../middlewares/validateQuoteInput");

router.post("/", validateQuoteInput, handleQuote);

module.exports = router;
