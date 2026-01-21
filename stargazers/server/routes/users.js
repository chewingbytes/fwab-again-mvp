
import { verifyToken } from "../authmiddleware.js";
import express from "express";
import db from "../db/conn.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const JWT_SECRET = process.env.JWT_TOKEN;

const router = express.Router();

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore" });
};


// Use local JSON file for users
router.post("/add-user", (req, res) => {
  const password = "defaultstargazersPassword";
  const { username, email, roles } = req.body;
  // Express routes removed. No code needed.
    let users = db.readUsers();

    const existingUser = users.find(
