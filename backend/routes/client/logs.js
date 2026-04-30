const express = require("express");
const auth = require("../../middleware/auth");
const ClientLogController = require("../../controllers/client/logController");

const router = express.Router();

router.get("/", auth, ClientLogController.getLogs);
router.get("/session/:sessionId", auth, ClientLogController.getSessionLogs);

module.exports = router;
