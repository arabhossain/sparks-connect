const express = require("express");
const auth = require("../../middleware/auth");
const ClientHostController = require("../../controllers/client/hostController");

const router = express.Router();

router.get("/", auth, ClientHostController.getHosts);
router.post("/", auth, ClientHostController.createHost);
router.put("/:id", auth, ClientHostController.updateHost);
router.delete("/:id", auth, ClientHostController.deleteHost);

module.exports = router;
