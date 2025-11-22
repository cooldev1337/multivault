# MultiVault MiniApp 🚀

Telegram MiniApp para gestionar billeteras compartidas multi-chain con total transparencia.

## 🏗️ Arquitectura

### Flujo de Autenticación

```
1. Usuario → /start en Telegram Bot
   ↓
2. Backend crea Embedded Wallet automáticamente (CDP)
   ↓
3. Usuario abre MiniApp desde Telegram
   ↓
4. MiniApp obtiene datos de Telegram + wallet del backend
   ↓
5. Usuario autenticado automáticamente ✅
```

### Stack Tecnológico

**Frontend:**

- React 19 + TypeScript
- Vite (build tool)
- React Router (navegación)
- Radix UI + Tailwind CSS (UI components)
- Telegram WebApp SDK (@twa-dev/sdk)

**Backend Integration:**

- API REST para obtener wallet del usuario
- Coinbase Developer Platform (CDP) para embedded wallets
- Sin Web3Auth (autenticación vía Telegram directamente)

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar URL del backend en .env
VITE_API_URL=http://localhost:5000/api

# Modo desarrollo
npm run dev

# Build de producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Landing.tsx     # Página inicial
│   ├── Dashboard.tsx   # Panel principal
│   ├── TelegramOnboarding.tsx  # Onboarding con carga de wallet
│   ├── CreateWallet.tsx        # Crear wallet compartida
│   ├── ProposalsScreen.tsx     # Sistema de propuestas
│   └── ui/             # Componentes UI (Radix)
├── contexts/           # Contextos React
│   ├── TelegramContext.tsx  # Integración Telegram
│   └── WalletContext.tsx    # Estado de wallets
├── services/           # Servicios API
│   └── api.ts         # Comunicación con backend
├── types/             # Tipos TypeScript
│   └── index.ts       # Definiciones de tipos
└── utils/             # Utilidades
    └── validation/    # Validaciones Zod
```

## 🔑 Características Principales

### ✅ Autenticación Automática

- No requiere login manual
- Wallet creada automáticamente al dar /start
- Integración nativa con Telegram

### 💼 Wallets Compartidas

- Multi-signature simplificado
- Roles: Admin, Approver, Contributor
- Sistema de aprobaciones por mayoría

### 📊 Dashboard

- Balance en tiempo real
- Historial de transacciones
- Filtros por estado (pending/approved/executed)
- Categorización de gastos

### 🗳️ Sistema de Propuestas

- Crear propuestas de gasto
- Votación approve/reject
- Progreso visual de aprobaciones

## 🔗 Integración con Backend

El MiniApp se comunica con el backend para:

```typescript
// Obtener usuario y wallet (creada en /start)
getOrCreateUser(telegramUser) → BackendUser

// Obtener wallets del usuario
getUserWallets(userId) → BackendWallet[]

// Crear wallet compartida
createSharedWallet(data) → Wallet
```

## 🎨 Componentes Eliminados

❌ **Web3AuthProvider** - No se usa (autenticación vía Telegram)
❌ **Wallet Connect** - No necesario (embedded wallets)
❌ **Login manual** - Autenticación automática

## 🌐 Variables de Entorno

```bash
VITE_API_URL=http://localhost:5000/api  # URL del backend
```

## 📱 Desarrollo con Telegram

### Opción 1: Telegram Web

```bash
npm run dev
# Abrir en: https://web.telegram.org
# Usar @BotFather para configurar MiniApp URL
```

### Opción 2: ngrok (testing remoto)

```bash
ngrok http 3000
# Usar URL de ngrok en configuración del bot
```

## 🧪 Testing Local (sin Telegram)

El TelegramContext tiene fallback para desarrollo:

- Usuario mock cuando no está en Telegram
- Haptic feedback deshabilitado
- Funcionalidad completa sin restricciones

## 🚢 Deploy

```bash
# Build de producción
npm run build

# Preview del build
npm run preview

# Deploy a Vercel/Netlify
# Configurar VITE_API_URL con URL de producción
```

## 📚 Documentación Adicional

- [Telegram MiniApps](https://core.telegram.org/bots/webapps)
- [Coinbase CDP](https://docs.cdp.coinbase.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Router](https://reactrouter.com/)

## 🤝 Contribuir

Este proyecto es parte de ETHGlobal Hackathon.

---

**Built with ❤️ for LATAM communities 🌎**
