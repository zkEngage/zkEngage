import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authService } from "../services/auth";

const router = Router();
const prisma = new PrismaClient();

router.post("/wallet-auth", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "Wallet required" });

    let user = await prisma.user.findUnique({ where: { wallet: walletAddress } });

    if (!user) {
      // Automatically create user if not found
      user = await prisma.user.create({ data: { wallet: walletAddress } });
    }

    const token = authService.generateJWT(user);
    return res.json({ token, user });
  } catch (err) {
    console.error("Wallet auth error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = authService.verifyJWT(token); // 👈 assumes you have verifyJWT in your authService

    if (!payload?.id) return res.status(403).json({ error: "Invalid token" });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;
