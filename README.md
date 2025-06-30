# Vay Master

Социальная сеть и маркетплейс для мастеров, клиентов и магазинов.

## О проекте

Vay Master - это платформа, объединяющая:
- Строительных мастеров
- Автомехаников
- Разнорабочих
- Магазины стройматериалов и автозапчастей
- Клиентов, ищущих услуги

## Основные возможности

- Три типа пользователей: клиенты, мастера и магазины
- Instagram-подобные профили с публикациями и подписками
- Поиск специалистов по карте и фильтрам
- Рейтинги и отзывы
- Публикация товаров магазинами
- Система избранного

## Технологии

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- База данных: PostgreSQL
- ORM: Prisma
- Карты: Mapbox
- Кэширование: Redis

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/vay-master.git
cd vay-master
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` и добавьте необходимые переменные окружения:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vay_master"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token"
```

4. Выполните миграции базы данных:
```bash
npx prisma migrate dev
```

5. Запустите приложение:
```bash
npm run dev
```

## Структура проекта

```
vay-master/
├── app/                    # Next.js App Router
│   ├── components/        # Общие компоненты
│   ├── (auth)/           # Маршруты аутентификации
│   ├── (dashboard)/      # Защищенные маршруты
│   └── api/              # API маршруты
├── prisma/                # Схема и миграции базы данных
├── public/                # Статические файлы
└── types/                 # TypeScript типы
```

## Тестирование

Для запуска тестов используйте команду:
```bash
npm test
```

## Лицензия

MIT 