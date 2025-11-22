const userService = require("../services/user.service");

exports.getAllUsers = (req, res) => {
  res.json(userService.findAll());
};

exports.getUserById = (req, res) => {
  const user = userService.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

exports.createUser = (req, res) => {
  const created = userService.create(req.body);
  res.status(201).json(created);
};
