import Announcement from "../models/anouncement.js";

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });

    return res.status(200).json({
      announcements,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching announcements",
      error: error.message,
    });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
    });

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating announcement",
      error: error.message,
    });
  }
};