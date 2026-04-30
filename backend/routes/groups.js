const express = require("express");
const auth = require("../middleware/auth");
const groupController = require("../controllers/groupController");

const router = express.Router();

router.get("/", auth, groupController.getGroups);
router.post("/", auth, groupController.createGroup);
router.delete("/:id", auth, groupController.deleteGroup);

module.exports = router;