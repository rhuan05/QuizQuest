import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../auth/service/auth.service";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Token Inválido." });

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch {
        return res.status(403).json({ message: "Token Inválido ou Expirado" })
    }
};