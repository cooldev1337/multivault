# MultiVault Backend - Vault API

## Configuración

Asegúrate de tener estas variables en tu archivo `.env`:

```env
# Blockchain Configuration
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=tu_private_key_aqui
FACTORY_ADDRESS=0x046700ae667B9bB6855b02D4a5996Dc2dadf400d
```

## Comandos del Bot de Telegram

### `/createvault`

Crea una nueva community wallet. El bot te pedirá que respondas con:

```
nombre|address1,address2,address3
```

**Ejemplo:**

```
Family Fund|0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,0x123...
```

### `/myvaults`

Ver todas tus community wallets con su información (balance, miembros, propuestas).

### `/ownwallet`

Ver tu wallet personal y balance de USDC.

## API Endpoints

### Factory Endpoints

#### `POST /api/vaults/create`

Crea una nueva vault.

**Body:**

```json
{
  "name": "Family Fund",
  "members": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x456..."]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Vault created successfully",
  "data": {
    "success": true,
    "vaultAddress": "0x...",
    "txHash": "0x...",
    "blockNumber": 12345
  }
}
```

#### `GET /api/vaults/all`

Obtiene todas las vaults creadas.

#### `GET /api/vaults/user/:address`

Obtiene las direcciones de todas las vaults de un usuario.

#### `GET /api/vaults/user/:address/details`

Obtiene información detallada de todas las vaults de un usuario.

### Vault Information Endpoints

#### `GET /api/vaults/:address`

Obtiene información de una vault específica.

**Response:**

```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "name": "Family Fund",
    "members": ["0x...", "0x..."],
    "balance": "1.5",
    "balanceWei": "1500000000000000000",
    "proposalCounter": 3,
    "memberCount": 4
  }
}
```

#### `GET /api/vaults/:address/proposals/:proposalId`

Obtiene información de una propuesta específica.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 0,
    "type": "WITHDRAWAL",
    "proposer": "0x...",
    "description": "Pay rent",
    "recipient": "0x...",
    "amount": "0.5",
    "amountWei": "500000000000000000",
    "newMember": "0x0000000000000000000000000000000000000000",
    "votesFor": 2,
    "votesAgainst": 0,
    "status": "PENDING"
  }
}
```

### Vault Action Endpoints

#### `POST /api/vaults/:address/deposit`

Deposita ETH en una vault.

**Body:**

```json
{
  "amount": "1.0"
}
```

#### `POST /api/vaults/:address/propose-withdrawal`

Crea una propuesta de retiro.

**Body:**

```json
{
  "description": "Pay monthly rent",
  "recipient": "0x...",
  "amount": "0.5"
}
```

#### `POST /api/vaults/:address/propose-add-member`

Crea una propuesta para agregar un miembro.

**Body:**

```json
{
  "description": "Add Juan to the vault",
  "newMember": "0x..."
}
```

#### `POST /api/vaults/:address/vote`

Vota en una propuesta.

**Body:**

```json
{
  "proposalId": 0,
  "inFavor": true
}
```

#### `GET /api/vaults/:address/proposals/:proposalId/has-voted/:voter`

Verifica si un usuario ha votado en una propuesta.

## Tipos de Propuestas

- **WITHDRAWAL**: Retiro de fondos
- **ADD_MEMBER**: Agregar nuevo miembro

## Estados de Propuestas

- **PENDING**: Pendiente de votación
- **EXECUTED**: Ejecutada (alcanzó mayoría)
- **REJECTED**: Rechazada (todos votaron pero no alcanzó mayoría)

## Notas Importantes

1. **Mayoría Simple**: Se requiere más del 50% de votos a favor para ejecutar una propuesta.
2. **Ejecución Automática**: Las propuestas se ejecutan automáticamente al alcanzar la mayoría.
3. **Gas Fees**: Todas las transacciones requieren gas. Asegúrate de que el wallet configurado tenga ETH suficiente.
4. **Red**: Por defecto está configurado para Base Sepolia (testnet).
