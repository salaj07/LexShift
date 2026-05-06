const jw = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require('../utils/logger');

const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = await jw.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("=password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn(`Auth middleware: invalid token — ${error.message}`);
    res.status(401).json({ message: "invalid token" });
  }
};

module.exports = authRequired;
