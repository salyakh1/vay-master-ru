"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleRegister } from "@/lib/auth";
import { signIn } from "next-auth/react";
import type { UserRole } from "@/types/user";
import Link from "next/link";

// Вспомогательные функции форматирования
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatPhoneNumber = (phone: string): string => {
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '');
  
  // Если номер начинается с 7 или 8, заменяем на +7
  if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
    return '+7' + cleaned.slice(1);
  }
  
  // Если номер не начинается с 7 или 8, добавляем +7
  return '+7' + cleaned;
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.email) {
      errors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Некорректный email";
    }

    if (!form.password) {
      errors.password = "Пароль обязателен";
    } else if (form.password.length < 6) {
      errors.password = "Пароль должен быть не менее 6 символов";
    }

    if (role === "MASTER") {
      if (!form.firstName) {
        errors.firstName = "Имя обязательно";
      }
      if (!form.lastName) {
        errors.lastName = "Фамилия обязательна";
      }
    }

    if (!form.phone) {
      errors.phone = "Телефон обязателен";
    }

    if (!form.city) {
      errors.city = "Город обязателен";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    
    if (Object.keys(validation).length === 0) {
      setIsLoading(true);
      try {
        const userData = {
          email: form.email,
          password: form.password,
          role: role,
          name: `${form.firstName} ${form.lastName}`,
          phone: form.phone,
          city: form.city,
        };

        const result = await handleRegister(userData);
        
        if (result.success) {
          // Выполняем автоматический вход после успешной регистрации
          const signInResult = await signIn('credentials', {
            email: form.email,
            password: form.password,
            redirect: false
          });

          if (signInResult?.error) {
            setErrors({ submit: 'Ошибка входа после регистрации' });
            return;
          }

          // Добавляем небольшую задержку для корректной инициализации сессии
          await new Promise(resolve => setTimeout(resolve, 500));

          // Перенаправляем пользователя в зависимости от роли
          if (result.role === "MASTER") {
            router.push("/profile/setup");
          } else {
            router.push("/");
          }
        } else {
          setErrors({ submit: result.error });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Регистрация
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Выбор роли */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кто вы?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={`py-2 px-4 rounded-lg border ${
                    role === "CLIENT"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Клиент
                </button>
                <button
                  type="button"
                  onClick={() => setRole("MASTER")}
                  className={`py-2 px-4 rounded-lg border ${
                    role === "MASTER"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Мастер
                </button>
              </div>
            </div>

            {/* Поля для мастера */}
            {role === "MASTER" && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Имя
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Город
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>
        </form>

        <div className="text-sm text-center mt-4">
          <span className="text-gray-600">Уже есть аккаунт?</span>{' '}
          <Link href="/auth/login">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Войти
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
} 