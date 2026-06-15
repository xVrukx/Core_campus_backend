// controllers/auth.controller.js

import User from "../models/User.js";
import Teacher from "../models/Teacher.js";

export const login = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        message: "Name and password are required",
      });
    }

    let user = await User.findOne({
      name,
      password,
    });

    if (!user) {
      user = await Teacher.findOne({
        name,
        password,
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid name or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};