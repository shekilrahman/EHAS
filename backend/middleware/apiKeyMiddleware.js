require("dotenv").config();

const apiKey = "ehasapikey";

const apiKeyMiddleware = (req, res, next) => {
  const providedApiKey = req.headers["api-key"];

  if (!providedApiKey || providedApiKey !== apiKey) {
    return res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
  next();
};

module.exports = apiKeyMiddleware;
