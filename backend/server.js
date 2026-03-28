const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const hostRoutes = require("./routes/hosts");
const tagRoutes = require("./routes/tags");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/hosts", hostRoutes);
app.use("/tags", tagRoutes);

app.listen(4000, () => {
    console.log("🚀  API running on 4000");
});