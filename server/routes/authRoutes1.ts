import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db"; // your Prisma client
import { authService } from "../services/auth";
import { zkVerifyService } from "../services/zkverify";

const router = Router();

/**
 * Email/Password Signup
 */
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, username, email, password: hashedPassword },
    });

    await zkVerifyService.generateAuthProof(newUser.id, "signup");
    const token = authService.generateJWT(newUser);

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Email/Password Login
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    await zkVerifyService.generateAuthProof(user.id, "login");
    const token = authService.generateJWT(user);

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Wallet-based Login / Signup
 */
// POST /api/auth/wallet-auth
router.post("/wallet-auth", async (req: Request, res: Response) => {
  const { walletAddress } = req.body;

  if (!walletAddress) return res.status(400).json({ message: "Wallet address required" });

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { walletAddress } });

  // If not, create user (signup flow)
  if (!user) {
    user = await prisma.user.create({
      data: { walletAddress, username: `user_${walletAddress.slice(0, 6)}` },
    });
  }

  // Generate JWT token
  const token = authService.generateJWT(user);

  res.json({ token, user });
});


/**
 * Protected Route Example
 */
router.get("/profile", authService.authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
