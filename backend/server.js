const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const hostRoutes = require("./routes/hosts");

const groupRoutes = require("./routes/groups");
const clientRoutes = require("./routes/client");
const telemetryRoutes = require("./routes/telemetry");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/hosts", hostRoutes);

app.use("/groups", groupRoutes);
app.use("/client", clientRoutes);
app.use("/telemetry", telemetryRoutes);

app.listen(4000, () => {
    console.log("🚀  API running on 4000");
});