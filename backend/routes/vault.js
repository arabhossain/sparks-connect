const express = require("express");
const auth = require("../middleware/auth");
const vaultController = require("../controllers/vaultController");

const router = express.Router();

router.use(auth);

router.get("/", vaultController.getVault);
router.post("/item", vaultController.addItem);
router.put("/item/:id", vaultController.updateItem);
router.delete("/item/:id", vaultController.deleteItem);

module.exports = router;
