import { API } from '../config';

export const VaultService = {
    getVault: async (token: string) => {
        const res = await fetch(`${API}/vault`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch vault");
        return res.json();
    },

    addItem: async (token: string, type: string, encrypted_data: string, iv: string, tag: string) => {
        const res = await fetch(`${API}/vault/item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ type, encrypted_data, iv, tag })
        });
        if (!res.ok) throw new Error("Failed to add vault item");
        return res.json();
    },

    updateItem: async (token: string, id: string, type: string, encrypted_data: string, iv: string, tag: string) => {
        const res = await fetch(`${API}/vault/item/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ type, encrypted_data, iv, tag })
        });
        if (!res.ok) throw new Error("Failed to update vault item");
        return res.json();
    },

    deleteItem: async (token: string, id: string) => {
        const res = await fetch(`${API}/vault/item/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to delete vault item");
        return res.json();
    }
};
