const express = require("express");
const router = express.Router();
const handleContact  = require("../controllers/contact.controller");
const validateInput = require("../middlewares/validateInput");

router.post("/send-message", validateInput, handleContact);

module.exports = router;
