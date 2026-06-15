import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
} from "../controllers/announcement.controller.js";

export const announcement_router = express.Router();

announcement_router.get("/", getAnnouncements);
announcement_router.post("/", createAnnouncement);