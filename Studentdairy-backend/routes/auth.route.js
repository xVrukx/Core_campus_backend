// routes/auth.route.js
import express from "express";
import { login } from "../controllers/auth.controller.js";

export const authroute = express.Router();

authroute.post("/login", login);