const crypto = require("crypto");
require("dotenv").config();

const SECRET = process.env.CRYPTO_SECRET;

function encrypt(text) {
    const cipher = crypto.createCipher("aes-256-ctr", SECRET);
    return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function decrypt(hash) {
    const decipher = crypto.createDecipher("aes-256-ctr", SECRET);
    return decipher.update(hash, "hex", "utf8") + decipher.final("utf8");
}

module.exports = { encrypt, decrypt };