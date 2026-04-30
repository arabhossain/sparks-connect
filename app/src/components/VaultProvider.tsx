import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoService } from '../services/cryptoService';
import { VaultService } from '../services/vaultService';
import toast from 'react-hot-toast';

export interface VaultItem {
    id: string;
    vault_id: string;
    type: string;
    encrypted_data: string;
    iv: string;
    tag: string;
    decrypted_data?: any; // The plaintext payload
}

interface VaultContextType {
    isUnlocked: boolean;
    unlockVault: (password: string) => Promise<boolean>;
    lockVault: () => void;
    items: VaultItem[];
    addSnippet: (snippet: any) => Promise<void>;
    updateSnippet: (id: string, snippet: any) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    saveWorkspace: (workspace: any) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export const useVault = () => {
    const ctx = useContext(VaultContext);
    if (!ctx) throw new Error("useVault must be used within VaultProvider");
    return ctx;
};

export const VaultProvider: React.FC<{ children: React.ReactNode, token: string | null }> = ({ children, token }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
    const [items, setItems] = useState<VaultItem[]>([]);
    const [vaultId, setVaultId] = useState<string | null>(null);

    // Clear memory on logout
    useEffect(() => {
        if (!token) {
            lockVault();
        }
    }, [token]);

    const lockVault = () => {
        setIsUnlocked(false);
        setCryptoKey(null);
        setItems([]);
        setVaultId(null);
    };

    const unlockVault = async (password: string): Promise<boolean> => {
        if (!token) return false;
        try {
            // Use username or a fixed salt string for key derivation
            const username = localStorage.getItem("username") || "default_salt";
            const key = await CryptoService.deriveKey(password, username);
            
            // Fetch vault from backend
            const { vault, items: encryptedItems } = await VaultService.getVault(token);
            setVaultId(vault.id);

            // Attempt to decrypt items to verify key
            const decryptedItems = [];
            for (const item of encryptedItems) {
                try {
                    const decryptedStr = await CryptoService.decrypt(item.encrypted_data, item.iv, key);
                    decryptedItems.push({
                        ...item,
                        decrypted_data: JSON.parse(decryptedStr)
                    });
                } catch (e) {
                    console.error("Failed to decrypt item:", item.id);
                    // Decryption failed, wrong password or corrupted data
                    throw new Error("Invalid password or corrupted vault.");
                }
            }

            setCryptoKey(key);
            setItems(decryptedItems);
            setIsUnlocked(true);
            return true;
        } catch (error) {
            console.error("Vault unlock error:", error);
            toast.error("Failed to unlock vault. Incorrect password?");
            return false;
        }
    };

    const addSnippet = async (snippet: any) => {
        if (!cryptoKey || !token) return;
        try {
            const { ciphertext, iv } = await CryptoService.encrypt(JSON.stringify(snippet), cryptoKey);
            const newItem = await VaultService.addItem(token, 'snippet', ciphertext, iv, snippet.name);
            setItems(prev => [...prev, { ...newItem, decrypted_data: snippet }]);
            toast.success("Snippet saved");
        } catch (error) {
            toast.error("Failed to save snippet");
            console.error(error);
        }
    };

    const updateSnippet = async (id: string, snippet: any) => {
        if (!cryptoKey || !token) return;
        try {
            const { ciphertext, iv } = await CryptoService.encrypt(JSON.stringify(snippet), cryptoKey);
            await VaultService.updateItem(token, id, 'snippet', ciphertext, iv, snippet.name);
            setItems(prev => prev.map(item => item.id === id ? { ...item, encrypted_data: ciphertext, iv, tag: snippet.name, decrypted_data: snippet } : item));
            toast.success("Snippet updated");
        } catch (error) {
            toast.error("Failed to update snippet");
            console.error(error);
        }
    };

    const deleteItem = async (id: string) => {
        if (!token) return;
        try {
            await VaultService.deleteItem(token, id);
            setItems(prev => prev.filter(item => item.id !== id));
            toast.success("Item deleted");
        } catch (error) {
            toast.error("Failed to delete item");
            console.error(error);
        }
    };

    const saveWorkspace = async (workspace: any) => {
        if (!cryptoKey || !token) return;
        try {
            const { ciphertext, iv } = await CryptoService.encrypt(JSON.stringify(workspace), cryptoKey);
            const newItem = await VaultService.addItem(token, 'secret', ciphertext, iv, `workspace_${workspace.name}`);
            setItems(prev => [...prev, { ...newItem, decrypted_data: workspace }]);
            toast.success(`Workspace ${workspace.name} saved`);
        } catch (error) {
            toast.error("Failed to save workspace");
            console.error(error);
        }
    };

    return (
        <VaultContext.Provider value={{ isUnlocked, unlockVault, lockVault, items, addSnippet, updateSnippet, deleteItem, saveWorkspace }}>
            {children}
        </VaultContext.Provider>
    );
};
