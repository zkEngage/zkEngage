import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { authService } from "../services/auth";
import { zkVerifyService } from "../services/zkverify";
// You should have a User model or a DB connection here:
import { prisma } from "../db"; // or replace with your DB logic

const router = Router();

/**
 * Signup Route
 */
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
      },
    });

    // Generate zkVerify proof
    await zkVerifyService.generateAuthProof(newUser.id, "signup");

    // Generate JWT
    const token = authService.generateJWT(newUser);

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Login Route
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate zkVerify proof
    await zkVerifyService.generateAuthProof(user.id, "login");

    // Generate JWT
    const token = authService.generateJWT(user);

    res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Protected Route Example
 */
router.get("/profile", authService.authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
});

export default router;
