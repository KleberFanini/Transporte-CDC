import { SignJWT, jwtVerify } from "jose";

// Validação da variável de ambiente
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não está definida no arquivo .env");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function criarToken(payload: Record<string, any>) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Date.now())
        .setExpirationTime("7d")
        .sign(secret);
}

export async function validarToken(token: string) {
    const { payload } = await jwtVerify(token, secret);
    return payload;
}