// Utility to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Utility to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export const CryptoService = {
    /**
     * Derives a cryptographic key from a user password and a salt.
     */
    deriveKey: async (password: string, saltStr: string): Promise<CryptoKey> => {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        let saltBuffer: ArrayBuffer;
        if (!saltStr) {
            saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
        } else {
            saltBuffer = enc.encode(saltStr);
        }

        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: saltBuffer,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },

    /**
     * Encrypts plaintext data using AES-GCM.
     */
    encrypt: async (plaintext: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> => {
        const enc = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(plaintext)
        );

        return {
            ciphertext: bufferToBase64(encryptedBuffer),
            iv: bufferToBase64(iv.buffer)
        };
    },

    /**
     * Decrypts ciphertext back to plaintext using AES-GCM.
     */
    decrypt: async (ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> => {
        const encryptedBuffer = base64ToBuffer(ciphertextBase64);
        const ivBuffer = base64ToBuffer(ivBase64);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
            key,
            encryptedBuffer
        );

        const dec = new TextDecoder();
        return dec.decode(decryptedBuffer);
    }
};
