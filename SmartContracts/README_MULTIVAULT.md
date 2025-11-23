# MultiVault - Sistema de Wallet Comunitaria Multisig

Sistema de wallet comunitaria basado en smart contracts que permite a múltiples usuarios gestionar fondos de manera colaborativa mediante propuestas y votaciones.

## 🎯 Características Principales

- **Wallets Comunitarias**: Crea vaults con múltiples miembros (mínimo 2)
- **Depósitos**: Cualquier miembro puede depositar fondos en el vault
- **Sistema de Propuestas**:
  - Propuestas de retiro (con descripción, monto y destinatario)
  - Propuestas para agregar nuevos miembros
- **Votación Democrática**: Mayoría simple (>50%) para aprobar propuestas
- **Ejecución Automática**: Las propuestas se ejecutan automáticamente al alcanzar el quorum

## 📋 Funcionalidades

### Crear Vault

```javascript
createVault(string name, address[] members)
```

- Requiere mínimo 2 miembros
- El creador debe estar incluido en la lista de miembros

### Depositar Fondos

```javascript
deposit(uint256 vaultId) payable
```

- Solo miembros pueden depositar
- Los fondos se acumulan en el balance del vault

### Proponer Retiro

```javascript
proposeWithdrawal(uint256 vaultId, string description, address recipient, uint256 amount)
```

- Describe el propósito del retiro
- Especifica destinatario y monto
- Requiere fondos suficientes en el vault

### Proponer Agregar Miembro

```javascript
proposeAddMember(uint256 vaultId, string description, address newMember)
```

- Propone agregar un nuevo miembro al vault
- El nuevo miembro no puede ser un miembro existente

### Votar

```javascript
vote(uint256 proposalId, bool inFavor)
```

- Cada miembro vota una sola vez
- true = a favor, false = en contra
- Se ejecuta automáticamente al alcanzar mayoría simple

## 🔧 Instalación y Uso

### Instalar dependencias

```bash
npm install
```

### Compilar contratos

```bash
npx hardhat compile
```

### Ejecutar tests

```bash
npx hardhat test
```

### Desplegar en red local

```bash
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/MultiVault.js --network localhost
```

### Desplegar en testnet (ejemplo: Sepolia)

```bash
npx hardhat ignition deploy ./ignition/modules/MultiVault.js --network sepolia
```

## 📊 Estructura del Proyecto

```
SmartContracts/
├── contracts/
│   └── MultiVault.sol          # Contrato principal
├── ignition/
│   └── modules/
│       └── MultiVault.js        # Script de despliegue
├── test/
│   └── MultiVault.js            # Tests completos
├── hardhat.config.js
└── package.json
```

## 🧪 Tests Incluidos

- ✅ Creación de vaults
- ✅ Depósitos de fondos
- ✅ Propuestas de retiro
- ✅ Propuestas de agregar miembros
- ✅ Sistema de votación
- ✅ Ejecución automática con mayoría simple
- ✅ Rechazo de propuestas
- ✅ Prevención de doble voto
- ✅ Funciones de consulta

## 🎮 Ejemplo de Uso

```javascript
// 1. Crear vault con 3 miembros
await multiVault.createVault("Team Vault", [addr1, addr2, addr3]);

// 2. Depositar fondos
await multiVault.deposit(0, { value: ethers.parseEther("10.0") });

// 3. Crear propuesta de retiro
await multiVault.proposeWithdrawal(
  0,
  "Pago de servicios",
  recipientAddress,
  ethers.parseEther("1.0")
);

// 4. Votar (necesita 2 de 3 votos para ejecutar)
await multiVault.connect(addr1).vote(0, true);
await multiVault.connect(addr2).vote(0, true); // ✅ Se ejecuta automáticamente

// 5. Agregar nuevo miembro
await multiVault.proposeAddMember(0, "Agregar desarrollador", addr4);
await multiVault.connect(addr1).vote(1, true);
await multiVault.connect(addr2).vote(1, true); // ✅ addr4 es agregado
```

## 📝 Eventos

- `VaultCreated(uint256 vaultId, string name, address[] members)`
- `DepositMade(uint256 vaultId, address depositor, uint256 amount)`
- `ProposalCreated(uint256 proposalId, uint256 vaultId, ProposalType type, address proposer)`
- `VoteCasted(uint256 proposalId, address voter, bool inFavor)`
- `ProposalExecuted(uint256 proposalId, uint256 vaultId)`
- `ProposalRejected(uint256 proposalId, uint256 vaultId)`
- `MemberAdded(uint256 vaultId, address newMember)`
- `WithdrawalExecuted(uint256 vaultId, address recipient, uint256 amount)`

## 🔐 Seguridad

- ✅ Verificación de miembros en todas las operaciones
- ✅ Prevención de doble voto
- ✅ Validación de fondos antes de retiros
- ✅ Verificación de duplicados al agregar miembros
- ✅ Estados de propuestas (Pending/Executed/Rejected)

## 🚀 Próximas Mejoras Sugeridas

- [ ] Propuestas con fecha límite
- [ ] Propuestas para remover miembros
- [ ] Diferentes tipos de quorum configurables
- [ ] Roles y permisos personalizados
- [ ] Soporte para tokens ERC20
- [ ] Historial de transacciones
- [ ] Integración con frontend (React/Next.js)

## 📄 Licencia

MIT
