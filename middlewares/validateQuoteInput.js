module.exports = (req, res, next) => {
  const { name, email, service, budget, timeline, description } = req.body;

  if (!name || !email || !service || !budget || !timeline || !description) {
    return res.status(400).json({ error: "All required fields must be filled." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  next();
};
