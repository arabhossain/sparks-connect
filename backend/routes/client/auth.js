const express = require("express");
const ClientAuthController = require("../../controllers/client/authController");
const authenticate = require("../../middleware/auth");

const router = express.Router();

router.post("/register", ClientAuthController.register);
router.post("/login", ClientAuthController.login);
router.post("/change-password", authenticate, ClientAuthController.changePassword);
router.put("/organization", authenticate, ClientAuthController.updateOrganization);

module.exports = router;
