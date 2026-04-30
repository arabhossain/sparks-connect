const express = require("express");
const auth = require("../../middleware/auth");
const ClientUserController = require("../../controllers/client/userController");

const router = express.Router();

router.get("/me", auth, ClientUserController.getMe);
router.put("/me/track_activity", auth, ClientUserController.updateTrackActivity);
router.get("/", auth, ClientUserController.getAllUsers);

module.exports = router;
