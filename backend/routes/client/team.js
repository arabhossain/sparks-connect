const express = require("express");
const auth = require("../../middleware/auth");
const ClientTeamController = require("../../controllers/client/teamController");

const router = express.Router();

router.get("/", auth, ClientTeamController.getTeam);
router.post("/", auth, ClientTeamController.inviteTeammate);
router.put("/:id/permissions", auth, ClientTeamController.updatePermissions);
router.put("/:id/status", auth, ClientTeamController.updateStatus);
router.delete("/:id", auth, ClientTeamController.deleteTeammate);

module.exports = router;
