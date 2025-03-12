require("dotenv").config();

const apiKey = "badboys@teapot";

const apiKeyMiddleware = (req, res, next) => {
  const providedApiKey = req.headers["x-api-key"];

  if (!providedApiKey || providedApiKey !== apiKey) {
    return res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
  next();
};

module.exports = apiKeyMiddleware;
