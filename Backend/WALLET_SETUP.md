# MultiVault Backend - CDP Server-Signer Wallets

## 🔐 Configuración de Wallets

Este backend utiliza **Coinbase Developer Platform (CDP)** para crear **Server-Signer Wallets** automáticamente cuando un usuario inicia el bot de Telegram.

### ¿Qué es una Server-Signer Wallet?

Una **Server-Signer Wallet** es una wallet administrada por los servidores de Coinbase:
- ✅ **No requiere seed phrase** - Coinbase maneja las claves privadas de forma segura
- ✅ **Una wallet por usuario** - Vinculada al Telegram ID único
- ✅ **Fácil de usar** - Los usuarios no necesitan gestionar claves
- ✅ **Segura** - Protegida por la infraestructura de Coinbase

### 🚀 Configuración

1. **Obtener credenciales de CDP:**
   - Visita: https://portal.cdp.coinbase.com/
   - Crea una cuenta o inicia sesión
   - Genera un API Key con los siguientes permisos:
     - `wallet:create`
     - `wallet:read`
     - `wallet:transfer`
   - Guarda el `API Key Name` y `Private Key`

2. **Configurar variables de entorno:**
   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env
   
   # Edita .env y agrega tus credenciales
   CDP_API_KEY_NAME=your_api_key_name
   CDP_API_KEY_PRIVATE_KEY=your_private_key
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Ejecutar el servidor:**
   ```bash
   npm run dev
   ```

### 📱 Flujo de Usuario

1. **Usuario envía `/start` al bot de Telegram**
   - El sistema verifica si el Telegram ID ya existe en la base de datos
   - Si es nuevo, crea una Server-Signer Wallet en Base Sepolia
   - Guarda la información de la wallet vinculada al Telegram ID
   - Envía un mensaje con la dirección de la wallet

2. **Usuario puede ver su wallet con `/wallet`**
   - Muestra la dirección de la wallet
   - Muestra el Wallet ID
   - Indica que es una wallet administrada por servidor

### 🗄️ Estructura de Base de Datos

```javascript
users {
  id: integer (auto-increment)
  telegramId: text (unique) // Identificador único del usuario
  user: text // Username de Telegram (opcional)
  firstName: text
  lastName: text
  walletId: text (unique) // ID de la wallet en CDP
  walletAddress: text // Dirección pública de la wallet
  walletNetworkId: text // Red blockchain (Base Sepolia)
  created: integer
  updated: integer
}
```

### 🔑 Características de Seguridad

- **Un usuario = Una wallet:** Cada Telegram ID solo puede tener una wallet
- **No hay seed phrases:** Las wallets son server-signer, no se generan ni almacenan seeds
- **Identificación única:** Se usa el Telegram ID como identificador único e inmutable
- **Wallets persistentes:** Las wallets se crean una vez y persisten en CDP

### 🌐 Red de Blockchain

Por defecto, las wallets se crean en **Base Sepolia** (testnet). Puedes modificar esto en `cdp.service.js`:

```javascript
const wallet = await Wallet.create({
  networkId: Coinbase.networks.BaseSepolia, // Cambiar aquí
});
```

Redes disponibles:
- `Coinbase.networks.BaseMainnet` - Base Mainnet (producción)
- `Coinbase.networks.BaseSepolia` - Base Sepolia (testnet)
- `Coinbase.networks.EthereumMainnet` - Ethereum Mainnet
- `Coinbase.networks.EthereumSepolia` - Ethereum Sepolia

### 📚 API de CDP Wallet

El servicio `cdp.service.js` proporciona:

- `createWallet(telegramId)` - Crea una nueva server-signer wallet
- `fetchWallet(walletId)` - Obtiene una wallet existente
- `getWalletBalance(walletId)` - Consulta el balance de una wallet
- `getWalletAddress(walletId)` - Obtiene la dirección de una wallet

### 🛠️ Próximos Pasos

Para implementar funcionalidades adicionales:

1. **Transferencias:** Usar `wallet.transfer()` del SDK de CDP
2. **Balances:** Implementar endpoints para consultar balances
3. **Historial:** Agregar consulta de transacciones
4. **Multi-firma:** Crear vaults con múltiples firmantes

### 📖 Documentación

- [Coinbase Developer Platform Docs](https://docs.cdp.coinbase.com/)
- [CDP SDK GitHub](https://github.com/coinbase/coinbase-sdk-nodejs)
- [Base Network Docs](https://docs.base.org/)
