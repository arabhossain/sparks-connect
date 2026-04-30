const express = require("express");
const auth = require("../../middleware/auth");
const ClientStatsController = require("../../controllers/client/statsController");

const router = express.Router();

router.get("/", auth, ClientStatsController.getStats);

module.exports = router;
