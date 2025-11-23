const userService = require("../services/user.service");
const { CdpClient } = require("@coinbase/cdp-sdk");
const { getOrCreateUser } = require("../utils");

const cdp = new CdpClient();

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

// Endpoint para inicializar wallet cuando se abre la miniapp
exports.initializeWallet = async (req, res) => {
  try {
    const { userId, chatId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Crear o recuperar wallet usando CDP
    const userWallet = await cdp.evm.getOrCreateAccount({
      name: `${userId}`,
    });

    // Registrar usuario en la base de datos
    const user = await getOrCreateUser(userId, chatId, userWallet.address);

    res.json({
      success: true,
      walletAddress: userWallet.address,
      user,
    });
  } catch (error) {
    console.error("Error initializing wallet:", error);
    res.status(500).json({
      error: "Failed to initialize wallet",
      message: error.message,
    });
  }
};
