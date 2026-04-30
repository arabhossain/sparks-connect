const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// Proxy /api requests to the backend's /client namespace
app.use(
    "/api",
    createProxyMiddleware({
        target: BACKEND_URL,
        changeOrigin: true,
        pathRewrite: {
            "^/api": "",
        },
    })
);

// Serve the static React build files
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`🛡️  Web Proxy Layer running on port ${PORT}`);
    console.log(`➡️  Proxying /api to ${BACKEND_URL}/client`);
});
