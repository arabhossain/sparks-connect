const express = require("express");

const authRoutes = require("./auth");
const sessionsRoutes = require("./sessions");
const logsRoutes = require("./logs");
const usersRoutes = require("./users");
const hostsRoutes = require("./hosts");
const teamRoutes = require("./team");
const teamGroupsRoutes = require("./team-groups");
const statsRoutes = require("./stats");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/logs", logsRoutes);
router.use("/users", usersRoutes);
router.use("/hosts", hostsRoutes);
router.use("/team", teamRoutes);
router.use("/team-groups", teamGroupsRoutes);
router.use("/stats", statsRoutes);

module.exports = router;
