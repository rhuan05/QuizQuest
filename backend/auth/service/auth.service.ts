import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my-secret";

export function generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'});
};

export function verifyToken(token: string) {
    jwt.verify(token, JWT_SECRET);
};