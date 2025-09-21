import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../auth/service/auth.service";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido." });
    }

    try {
        const decoded = verifyToken(token) as any;
        
        // Verificar se o usuário tem role de admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Acesso negado. Privilégios de admin necessários." });
        }
        
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido ou expirado." });
    }
}
