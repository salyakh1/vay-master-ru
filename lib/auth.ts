import { authOptions } from './authOptions';
import { credentialsProvider } from './credentialsProvider';

// Добавляем провайдер к конфигурации
authOptions.providers = [credentialsProvider];

interface RegisterData {
  email: string;
  password: string;
  role: string;
  name: string;
  phone: string;
  city: string;
}

export async function handleRegister(data: RegisterData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'Произошла ошибка при регистрации' 
      };
    }

    return result;
  } catch (error) {
    console.error('Error in handleRegister:', error);
    return { 
      success: false, 
      error: 'Произошла ошибка при регистрации' 
    };
  }
}

export { authOptions }; 