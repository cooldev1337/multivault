/**
 * API Service para comunicación con el backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface BackendUser {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  walletAddress: string;
  createdAt: string;
}

export interface BackendWallet {
  id: string;
  address: string;
  network: string;
  createdAt: string;
}

/**
 * Obtener o crear usuario desde Telegram
 * El backend ya habrá creado la embedded wallet cuando el usuario dio /start
 */
export async function getOrCreateUser(telegramUser: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}): Promise<BackendUser> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/telegram/${telegramUser.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user from backend');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Fallback para desarrollo: crear usuario mock
    return {
      id: `user-${telegramUser.id}`,
      telegramId: telegramUser.id,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
      walletAddress: `0x${telegramUser.id.toString().padStart(40, '0')}`,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Obtener wallets del usuario
 */
export async function getUserWallets(userId: string): Promise<BackendWallet[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/wallets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallets');
    }

    const data = await response.json();
    return data.wallets;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }
}

/**
 * Crear una nueva wallet compartida
 */
export async function createSharedWallet(data: {
  name: string;
  userId: string;
  members: { email: string; role: string }[];
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/wallets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create wallet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
}
