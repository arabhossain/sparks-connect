const express = require("express");
const auth = require("../../middleware/auth");
const ClientTeamGroupController = require("../../controllers/client/teamGroupController");

const router = express.Router();

router.get("/", auth, ClientTeamGroupController.getGroups);
router.post("/", auth, ClientTeamGroupController.createGroup);
router.put("/:id", auth, ClientTeamGroupController.updateGroup);
router.delete("/:id", auth, ClientTeamGroupController.deleteGroup);

module.exports = router;
