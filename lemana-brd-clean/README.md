# Lemana BRD Agent — инструкция по деплою

## Что нужно для деплоя на Vercel

### Переменные окружения (вставить в Vercel при деплое):

| Имя переменной | Где взять |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NOTION_TOKEN` | notion.so/my-integrations → Personal access tokens |
| `NOTION_DATABASE_ID` | `36f16e34d7c280758cabd85aa6e6854c` |

---

## Шаги деплоя на Vercel

1. Зайди на vercel.com → Sign up (бесплатно)
2. New Project → Upload (загрузи папку lemana-brd)
3. В разделе Environment Variables добавь 3 переменные выше
4. Deploy → через 2 минуты получишь ссылку

---

## Последний шаг — дать доступ интеграции к базе данных Notion

1. Открой страницу «Сбор требований» в Notion
2. Нажми ••• (три точки) вверху справа → Connections
3. Найди свою интеграцию lemana-brd → подключи

Без этого шага записи не будут сохраняться!

---

## Стоимость
- Vercel: бесплатно
- Claude API: ~$0.01–0.02 за одно интервью  
- Notion API: бесплатно
