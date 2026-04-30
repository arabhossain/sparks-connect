const express = require("express");
const auth = require("../../middleware/auth");
const ClientSessionController = require("../../controllers/client/sessionController");

const router = express.Router();

router.get("/", auth, ClientSessionController.getSessions);

module.exports = router;
