const express = require("express");
const auth = require("../middleware/auth");
const hostController = require("../controllers/hostController");

const router = express.Router();

router.get("/", auth, hostController.getHosts);
router.post("/", auth, hostController.createHost);
router.put("/:id", auth, hostController.updateHost);
router.delete("/:id", auth, hostController.deleteHost);

module.exports = router;