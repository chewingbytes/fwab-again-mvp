import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken, requireRole } from "../authmiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const router = express.Router();
const JWT_SECRET = process.env.JWT_TOKEN;
const JWT_EXPIRY = "7d";

const usersFilePath = path.join(__dirname, "../../../stargazing.users.json");

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing users file:", error);
    return false;
  }
}

const formatDate = () => {
  return new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" });
};

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY },
  );
}

function userWithoutPassword(user) {
  const { password, ...userData } = user;
  return userData;
}

router.get("/", verifyToken, requireRole("admin"), (req, res) => {
  try {
    const users = readUsers();
    const usersWithoutPasswords = users.map(userWithoutPassword);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/me", verifyToken, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.email === req.user.email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: userWithoutPassword(user) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.get("/:email", verifyToken, requireRole("admin"), (req, res) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.email === req.params.email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userWithoutPassword(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    const users = readUsers();

    const existingUser = users.find(
      (u) => u.email === email || u.username === username,
    );
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _id: {
        $oid: Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
      username,
      email,
      password: hashedPassword,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      roles: "user",
    };

    users.push(newUser);

    if (writeUsers(users)) {
      const token = generateToken(newUser);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "Signup successful",
        user: userWithoutPassword(newUser),
      });
    } else {
      res.status(500).json({ error: "Failed to save user" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res
        .status(400)
        .json({ error: "Username/email and password are required" });
    }

    const users = readUsers();
    const user = users.find(
      (u) =>
        (username && u.username === username) || (email && u.email === email),
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    let isPasswordValid = false;
    if (user.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.json({
      message: "Login successful",
      user: userWithoutPassword(user),
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    const users = readUsers();

    const existingUser = users.find(
      (u) => u.email === email || u.username === username,
    );
    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    let hashedPassword = password || "defaultstargazersPassword";
    if (password && !password.startsWith("$2b$")) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = {
      _id: {
        $oid: Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
      username,
      email,
      password: hashedPassword,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      roles: roles || "user",
    };

    users.push(newUser);

    if (writeUsers(users)) {
      res.status(201).json(userWithoutPassword(newUser));
    } else {
      res.status(500).json({ error: "Failed to save user" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/:email", verifyToken, async (req, res) => {
  try {
    const { email: oldEmail } = req.params;
    const { username, email: newEmail, password, roles } = req.body;

    if (req.user.roles !== "admin" && req.user.email !== oldEmail) {
      return res
        .status(403)
        .json({ error: "Forbidden: Cannot update another user" });
    }

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.email === oldEmail);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    if (newEmail && newEmail !== oldEmail) {
      const emailTaken = users.find((u) => u.email === newEmail);
      if (emailTaken) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    if (username) users[userIndex].username = username;
    if (newEmail) users[userIndex].email = newEmail;
    if (roles && req.user.roles === "admin") users[userIndex].roles = roles; 
    if (password && !password.startsWith("$2b$")) {
      users[userIndex].password = await bcrypt.hash(password, 10);
    }
    users[userIndex].updatedAt = formatDate();

    if (writeUsers(users)) {
      res.json(userWithoutPassword(users[userIndex]));
    } else {
      res.status(500).json({ error: "Failed to update user" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:email", verifyToken, requireRole("admin"), (req, res) => {
  try {
    const { email } = req.params;
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);

    if (writeUsers(users)) {
      res.json({
        message: "User deleted successfully",
        user: userWithoutPassword(deletedUser),
      });
    } else {
      res.status(500).json({ error: "Failed to delete user" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
