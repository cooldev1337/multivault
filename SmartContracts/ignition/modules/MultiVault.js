const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MultiVaultFactoryModule", (m) => {
  // Desplegar el factory
  const factory = m.contract("MultiVaultFactory");

  return { factory };
});
