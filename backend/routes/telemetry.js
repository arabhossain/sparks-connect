const express = require("express");
const auth = require("../middleware/auth");
const telemetryController = require("../controllers/telemetryController");

const router = express.Router();

router.post("/session", auth, telemetryController.postSession);
router.post("/log", auth, telemetryController.postLog);

module.exports = router;
