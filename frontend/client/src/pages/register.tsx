import React, { useState } from "react";
import { apiRequest } from "../lib/queryClient";


export default function RegisterContent() {
    const [message, setMessage] = useState<string | null>(null);
    
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        console.log('Dados enviados: ', formData)
        const data = Object.fromEntries(formData.entries());

        try {
        const res = await apiRequest("POST", "/api/cadastro", data);

        const result = await res.json();

        if (!res.ok) {
            setMessage(result.message || "Erro desconhecido.");
        } else {
            setMessage(result.message);
        }
        } catch (err) {
            setMessage("Erro de rede. Tente novamente mais tarde.");
        }
    }

    return (
        <div>
            <h1>Cadastro</h1>
            <form onSubmit={handleSubmit} method="post">
                <input type="text" name="username" id="username" />
                <input type="email" name="email" id="email" />
                <input type="password" name="password" id="password" />
                <button>Cadastrar</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    )
};