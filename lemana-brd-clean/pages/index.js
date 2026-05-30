import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const TOPICS = [
  { id: 'screens', label: 'Где показываем', e: '📍' },
  { id: 'client',  label: 'Кто наш клиент', e: '👤' },
  { id: 'funnel',  label: 'Точка входа',    e: '🔀' },
  { id: 'content', label: 'Что в ленту',    e: '🎨' },
  { id: 'backend', label: 'Управление на бэке', e: '⚙️' },
];

const ROLES = [
  { id: 'pm',      name: 'Product Manager',  desc: 'Приоритеты, сценарии, метрики' },
  { id: 'content', name: 'Content',           desc: 'Типы контента, правила микса' },
  { id: 'media',   name: 'Media Production',  desc: 'DAM, разметка, жизненный цикл' },
  { id: 'dev',     name: 'Разработка',        desc: 'Интеграции, источники данных' },
  { id: 'head',    name: 'Руководитель',      desc: 'Стратегия, ограничения, риски' },
];

const ROLE_NAMES = { pm: 'Product Manager', content: 'Content', media: 'Media Production', dev: 'Разработка', head: 'Руководитель' };

const STATUS_LIST = [
  'Бизнес-заказчик',
  'Продукт / PM',
  'Разработка',
  'Маркетинг',
  'Контент',
  'Другое',
];

const ROLE_CTX = {
  pm:      'Собеседник — Product Manager. Фокус: какие экраны приоритетны, как ранжируем их, какие сценарии клиентского пути хотим охватить, критерии успеха фичи, метрики.',
  content: 'Собеседник — редактор или контент-менеджер. Фокус: какие типы контента планируем в ленту (советы, статьи, галереи, отзывы, категории), в каких пропорциях миксовать, кто принимает решения о попадании в ленту.',
  media:   'Собеседник — специалист по Media Production или DAM. Фокус: как устроена работа с DAM, что уже размечено и по каким атрибутам, что нужно дополнительно разметить для ленты, насколько материалы технически готовы.',
  dev:     'Собеседник — разработчик или технический архитектор. Фокус: откуда берём данные (цена, рейтинг, отзывы, товары), какие системы интегрируем (DAM, CDP, прайсинг), текущие технические ограничения.',
  head:    'Собеседник — руководитель. Фокус: стратегические приоритеты ленты, какие бизнес-цели она решает, ограничения по ресурсам, видимые риски, критерий успеха.',
};

const QUICK_REPLIES = {
  screens: [
    'Главная страница (веб)',
    'Главная (мобайл)',
    'PDP — карточка товара',
    'PLP — страница категории',
    'Корзина',
    'Поиск / SRP',
    'Избранное',
    'Пустая корзина',
    'Страница услуги',
    'Thank you page',
    'Личный кабинет',
    'Пустая выдача поиска',
    'Проектные лендинги',
  ],
  client: [
    'Авторизованный с историей покупок (знаем профиль из CDP)',
    'Авторизованный без истории (новый)',
    'Анонимный пользователь',
    'B2B / профессионал',
    'Персонализация по ценовому сегменту',
    'Персонализация по интересам (ремонт, декор, сад…)',
    'Персонализация по истории просмотров',
    'Все сегменты — разная глубина персонализации',
  ],
  funnel: [
    'Прямой заход — знает Lemana, высокое намерение',
    'Из органического поиска по запросу',
    'Из ремаркетинга — уже был на сайте',
    'Из соцсетей / вдохновения — намерение не сформировано',
    'Сохранённое намерение — возвращается к прерванному',
    'Стадия выбора — сравнивает варианты',
    'Стадия покупки — готов купить',
    'Постпокупочный визит',
  ],
  content: [
    'Lifestyle-фото — основа ленты (60%+)',
    'Товары с ценой и CTA',
    'Товары с рейтингом и отзывами',
    'Советы и инструкции',
    'Статьи и гайды',
    'Категории товаров',
    'Услуги Lemana',
    'Готовые решения / проекты',
    'Акции и спецпредложения',
    'Баннеры маркетинговых активностей',
    'Сезонные подборки',
    'Отзывы покупателей',
  ],
  backend: [
    'DAM — источник lifestyle-контента',
    'CDP — профиль и сегменты клиента',
    'Прайсинг-сервис — цены в реальном времени',
    'Платформа отзывов и рейтингов',
    'Сервис персонализации (уже есть)',
    'Товарные рекомендации',
    'Маркетинговая платформа — акции и промо',
    'Правила показа настраивает маркетинг (без кода)',
    'Правила показа настраивает разработка',
    'ML-ранжирование на основе поведения',
    'A/B тестирование вариантов ленты',
  ],
};

function sysPrompt(role, name, status) {
  return `Ты — AI-агент, собирающий бизнес-требования для «Бесконечной ленты вдохновения» Lemana PRO (бывший Leroy Merlin, DIY-ритейлер, 112 магазинов).

КОНЦЕПЦИЯ: Персонализированная бесконечная лента на сайте и в приложении. Визуально: lifestyle-фотографии доминируют, но аккуратно подмешиваются товары с ценой, рейтинги, советы, статьи, категории, услуги.

ВАЖНО: Проект на стадии сбора требований. Ничего не реализовано. Не упоминай сроки, этапы или статусы. Узнай, как команда хочет, чтобы это работало.

СОБЕСЕДНИК: Зовут ${name}, статус — ${status}. Обращайся к собеседнику по имени в разговоре.

РОЛЬ СОБЕСЕДНИКА: ${ROLE_CTX[role]}

ПЯТЬ ТЕМ:
1. ЭКРАНЫ — где размещаем ленту: главная, PLP, PDP, корзина, поиск, избранное, другие
2. ТИП КЛИЕНТА — сегменты (знаем профиль / новый / анонимный), данные из CDP, персонализация
3. ТОЧКА ВХОДА / ВОРОНКА — откуда пришёл клиент, этап принятия решения, сценарии поведения
4. КОНТЕНТ В ЛЕНТЕ — типы и пропорции: фото-вдохновение, товары с ценой, рейтинги, советы, статьи, категории, услуги, баннеры
5. УПРАВЛЕНИЕ НА БЭКЕ — интеграции (DAM, CDP, прайсинг, отзывы), кто настраивает правила

ПРАВИЛА:
- Один вопрос за раз, жди ответа
- После ответа: кратко резюмируй (1-2 предложения), потом следующий вопрос
- Уточняй если ответ поверхностный
- После закрытия темы скажи точно: "Тему разобрали. Переходим к следующей."
- После всех 5 тем напиши только: ГОТОВО
- Русский язык, тон профессиональный но живой
- Без маркдауна (звёздочек, решёток) в сообщениях
- В КОНЦЕ КАЖДОГО своего сообщения добавляй варианты ответа в формате: OPTIONS:[вариант 1|вариант 2|вариант 3|вариант 4]
- Варианты должны быть КОНКРЕТНЫМИ и релевантными именно к заданному вопросу
- Давай 4-8 вариантов — достаточно, чтобы покрыть основные ответы
- Для вопросов про ЭКРАНЫ всегда предлагай полный список: Главная страница|Главная (мобайл)|PDP — карточка товара|PLP — страница категории|Страница бренда|Корзина|Пустая корзина|Поиск / SRP|Пустая выдача поиска|Избранное|Сравнение товаров|Страница услуги|Thank you page|Личный кабинет|История заказов|Список покупок|Проектные лендинги|Акции и спецпредложения|404 страница
- Для вопросов про КЛИЕНТОВ: Авторизованный с историей покупок|Авторизованный без истории|Анонимный пользователь|B2B / профессионал|Клиент из программы лояльности|Новый клиент (первый визит)|Вернувшийся клиент|Клиент из определённого региона
- Для вопросов про КОНТЕНТ: Lifestyle-фото (вдохновение)|Товары с ценой и кнопкой «В корзину»|Товары с рейтингом и отзывами|Комплекты товаров|Советы и лайфхаки|Статьи и гайды|Видеоконтент|Категории товаров|Услуги Lemana|Готовые решения / проекты|Акции и скидки|Баннеры|Отзывы покупателей|Сезонные подборки|Новинки
- Для остальных вопросов — предлагай релевантные конкретные варианты
- OPTIONS всегда последняя строка сообщения, после неё ничего нет`;
}

const summaryPrompt = (role, name, status) => `Сформируй структурированный конспект требований на основе интервью.
Роль: ${ROLE_NAMES[role]}. Имя: ${name}. Статус: ${status}. Дата: ${new Date().toLocaleDateString('ru-RU')}.

Структура — строго по блокам (используй ### для заголовков):
### БЛОК 1: ЭКРАНЫ
### БЛОК 2: ТИП КЛИЕНТА
### БЛОК 3: ТОЧКА ВХОДА И ВОРОНКА
### БЛОК 4: КОНТЕНТ В ЛЕНТЕ
### БЛОК 5: УПРАВЛЕНИЕ НА БЭКЕ
### ОТКРЫТЫЕ ВОПРОСЫ
### СЛЕДУЮЩИЕ ШАГИ

Пиши конкретно. Если тема раскрыта частично — отметь. Без маркдауна кроме заголовков ###.`;

export default function Home() {
  const [screen, setScreen] = useState('intro'); // intro | start | chat | result
  const [role, setRole] = useState('pm');
  const [userName, setUserName] = useState('');
  const [userStatus, setUserStatus] = useState(STATUS_LIST[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [topicIdx, setTopicIdx] = useState(0);
  const [summary, setSummary] = useState('');
  const [chips, setChips] = useState([]);
  const [saved, setSaved] = useState(false);
  const histRef = useRef([]);
  const msgsEndRef = useRef(null);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function callClaude(userMsg, hist, sys) {
    const newHist = [...hist, { role: 'user', content: userMsg }];
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5-20250929', max_tokens: 800, system: sys, messages: newHist }),
    });
    const data = await res.json();
    if (!res.ok || !data.content) {
      const errMsg = data.error?.message || JSON.stringify(data);
      return { reply: `Ошибка API: ${errMsg}`, newHist };
    }
    return { reply: data.content?.[0]?.text || '', newHist };
  }

  function parseReply(reply) {
    // Handles OPTIONS:[a|b|c], OPTIONS: a|b|c, with or without brackets, with optional trailing whitespace
    const match = reply.match(/OPTIONS:\[?([^\]\n]+)\]?\s*$/m);
    const chips = match ? match[1].split('|').map(s => s.trim()).filter(Boolean) : [];
    const text = reply.replace(/\n?OPTIONS:[\s\[]?[^\]\n]+\]?\s*$/m, '').trim();
    return { text, chips };
  }

  async function startInterview() {
    setScreen('chat');
    setMessages([]);
    setTopicIdx(0);
    histRef.current = [];
    setBusy(true);
    const initMsg = `Начни интервью: поприветствуй ${userName} по имени, назови его роль (${ROLE_NAMES[role]}), объясни что собираем требования к ленте вдохновения по 5 темам, и задай первый вопрос по теме «Экраны».`;
    const { reply, newHist } = await callClaude(initMsg, [], sysPrompt(role, userName, userStatus));
    histRef.current = [...newHist, { role: 'assistant', content: reply }];
    if (reply.includes('Тему разобрали')) setTopicIdx(1);
    const { text: cleanReply0, chips: chips0 } = parseReply(reply);
    setChips(chips0);
    setMessages([{ role: 'agent', text: cleanReply0 }]);
    setBusy(false);
  }

  async function send() {
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setBusy(true);
    const { reply, newHist } = await callClaude(text, histRef.current, sysPrompt(role, userName, userStatus));
    histRef.current = [...newHist, { role: 'assistant', content: reply }];
    if (reply.trim() === 'ГОТОВО' || reply.includes('ГОТОВО')) {
      setBusy(false);
      await finishInterview();
      return;
    }
    if (reply.includes('Тему разобрали')) setTopicIdx(i => Math.min(i + 1, TOPICS.length - 1));
    const { text: cleanReply, chips: newChips } = parseReply(reply);
    setChips(newChips);
    setMessages(m => [...m, { role: 'agent', text: cleanReply }]);
    setBusy(false);
  }

  async function finishInterview() {
    setMessages(m => [...m, { role: 'agent', text: 'Все темы разобраны. Формирую конспект...' }]);
    const { reply } = await callClaude(summaryPrompt(role, userName, userStatus), histRef.current, sysPrompt(role, userName, userStatus));
    setSummary(reply);
    setTopicIdx(TOPICS.length);
    setScreen('result');
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: ROLE_NAMES[role], name: userName, status: userStatus, summary: reply, date: new Date().toLocaleDateString('ru-RU'), transcript: histRef.current }),
      });
      setSaved(true);
    } catch (e) { console.error(e); }
  }

  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  function copyResult() { navigator.clipboard.writeText(summary); }

  function reset() { setScreen('intro'); setMessages([]); setSummary(''); setSaved(false); setTopicIdx(0); histRef.current = []; }

  if (screen === 'intro') {
    return (
      <>
        <Head>
          <title>Сбор требований · Бесконечная лента · Lemana PRO</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
          <style>{`
            *{box-sizing:border-box;margin:0;padding:0}
            :root{--y:#F5C800;--yd:#C49B00;--yl:#FFF8CC;--bg:#f5f4f0;--bg2:#fff;--border:rgba(0,0,0,0.08);--text:#1a1a1a;--text2:#5a5a5a;--text3:#9b9b9b}
            body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);height:100vh;display:flex;flex-direction:column}
            header{background:#fff;border-bottom:1px solid var(--border);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
            .logo{font-family:'Unbounded',sans-serif;font-size:11px;font-weight:700;color:var(--yd);display:flex;align-items:center;gap:6px}
            .logo-dot{width:6px;height:6px;border-radius:50%;background:var(--y)}
            .badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:var(--yl);color:var(--yd)}
            .intro-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:32px}
            .intro-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:40px;width:100%;max-width:420px;display:flex;flex-direction:column;gap:24px}
            .intro-title{font-family:'Unbounded',sans-serif;font-size:16px;font-weight:700;line-height:1.35;color:var(--text)}
            .intro-title span{color:var(--y)}
            .intro-sub{font-size:13px;color:var(--text2);line-height:1.6;margin-top:-12px}
            .field{display:flex;flex-direction:column;gap:6px}
            .field label{font-size:12px;font-weight:600;color:var(--text2)}
            .field input,.field select{width:100%;padding:10px 14px;border-radius:9px;border:1px solid var(--border);font-family:'Inter',sans-serif;font-size:13px;color:var(--text);background:#fff;outline:none;transition:.12s;appearance:none;-webkit-appearance:none}
            .field input:focus,.field select:focus{border-color:var(--yd)}
            .select-wrap{position:relative}
            .select-wrap::after{content:'▾';position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--text3);pointer-events:none;font-size:12px}
            .intro-btn{padding:12px 24px;border-radius:9px;background:var(--y);border:none;cursor:pointer;font-family:'Unbounded',sans-serif;font-size:10px;font-weight:700;color:#1a1a1a;transition:.12s;width:100%}
            .intro-btn:hover:not(:disabled){background:var(--yd);color:#fff}
            .intro-btn:disabled{opacity:.4;cursor:not-allowed}
          `}</style>
        </Head>
        <header>
          <div className="logo"><span className="logo-dot" />Lemana PRO</div>
          <span className="badge">Сбор требований · Бесконечная лента</span>
        </header>
        <div className="intro-wrap">
          <div className="intro-card">
            <div className="intro-title">Сбор требований<br /><span>ленты вдохновения</span></div>
            <p className="intro-sub">Агент проведёт структурированное интервью по 5 темам и сформирует конспект для BRD.</p>
            <div className="field">
              <label>Ваше имя</label>
              <input
                type="text"
                placeholder="Введите имя..."
                value={userName}
                onChange={e => setUserName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label>Ваш статус</label>
              <div className="select-wrap">
                <select value={userStatus} onChange={e => setUserStatus(e.target.value)}>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button
              className="intro-btn"
              disabled={!userName.trim()}
              onClick={() => setScreen('start')}
            >
              Начать →
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Сбор требований · Бесконечная лента · Lemana PRO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          :root{--y:#F5C800;--yd:#C49B00;--yl:#FFF8CC;--bg:#f5f4f0;--bg2:#fff;--border:rgba(0,0,0,0.08);--text:#1a1a1a;--text2:#5a5a5a;--text3:#9b9b9b}
          body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);height:100vh;display:flex;flex-direction:column}
          header{background:#fff;border-bottom:1px solid var(--border);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
          .logo{font-family:'Unbounded',sans-serif;font-size:11px;font-weight:700;color:var(--yd);display:flex;align-items:center;gap:6px}
          .logo-dot{width:6px;height:6px;border-radius:50%;background:var(--y)}
          .badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:var(--yl);color:var(--yd)}
          .layout{display:grid;grid-template-columns:220px 1fr;flex:1;overflow:hidden}
          .sidebar{background:#fff;border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
          .sidebar-hd{padding:16px 14px 8px;font-family:'Unbounded',sans-serif;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)}
          .role-btn{display:block;width:100%;padding:10px 14px;border:none;background:none;cursor:pointer;text-align:left;border-bottom:1px solid var(--border);transition:.12s}
          .role-btn:hover{background:var(--bg)}
          .role-btn.active{background:var(--yl);border-left:2px solid var(--yd)}
          .role-name{font-size:12px;font-weight:500;color:var(--text)}
          .role-desc{font-size:10px;color:var(--text3);margin-top:2px;line-height:1.35}
          .role-btn.active .role-name{color:var(--yd);font-weight:600}
          .sep{height:1px;background:var(--border);margin:8px 0}
          .prog-hd{padding:8px 14px 4px;font-size:11px;font-weight:500;color:var(--text2)}
          .topic{display:flex;align-items:center;gap:7px;padding:5px 14px;font-size:11px;color:var(--text3);transition:.15s}
          .topic.done{color:var(--yd);font-weight:500}
          .topic.active{color:var(--text);font-weight:600}
          .tdot{width:7px;height:7px;border-radius:50%;background:var(--border);flex-shrink:0}
          .topic.done .tdot{background:var(--y)}
          .topic.active .tdot{background:var(--yd);box-shadow:0 0 0 2px rgba(196,155,0,.25)}
          .chat{display:flex;flex-direction:column;overflow:hidden}
          .start{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:32px;text-align:center;gap:12px}
          .start h1{font-family:'Unbounded',sans-serif;font-size:18px;font-weight:700;letter-spacing:-.02em;line-height:1.3;color:var(--text)}
          .start h1 span{color:var(--y)}
          .start p{font-size:13px;color:var(--text2);max-width:380px;line-height:1.65}
          .start-note{font-size:11px;color:var(--text3);background:var(--bg);border-radius:8px;padding:6px 12px}
          .start-btn{padding:11px 24px;border-radius:9px;background:var(--y);border:none;cursor:pointer;font-family:'Unbounded',sans-serif;font-size:10px;font-weight:700;color:#1a1a1a;transition:.12s;margin-top:4px}
          .start-btn:hover{background:var(--yd);color:#fff}
          .msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
          .msg{display:flex;gap:8px;animation:fi .25s ease}
          @keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
          .msg.agent{align-self:flex-start;max-width:80%}
          .msg.user{align-self:flex-end;flex-direction:row-reverse;max-width:80%}
          .av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:1px}
          .msg.agent .av{background:var(--y)}
          .msg.user .av{background:var(--text);color:#fff;font-size:9px;font-family:'Unbounded',sans-serif;font-weight:700}
          .bub{padding:10px 14px;border-radius:10px;font-size:13px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
          .msg.agent .bub{background:#fff;border:1px solid var(--border);border-radius:3px 10px 10px 10px;color:#1a1a1a}
          .msg.user .bub{background:#1a1a1a;color:#ffffff;border-radius:10px 3px 10px 10px}
          .typing{display:flex;gap:3px;padding:10px 14px;background:#fff;border:1px solid var(--border);border-radius:3px 10px 10px 10px;width:fit-content;margin-left:36px}
          .td{width:5px;height:5px;border-radius:50%;background:var(--yd);animation:b .8s infinite}
          .td:nth-child(2){animation-delay:.15s}.td:nth-child(3){animation-delay:.3s}
          @keyframes b{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}

          .chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 20px 0}
          .chip{padding:5px 12px;border-radius:20px;border:1px solid var(--border);background:#fff;font-size:11px;color:var(--text2);cursor:pointer;transition:.12s;font-family:'Inter',sans-serif;white-space:nowrap}
          .chip:hover{border-color:var(--yd);color:var(--yd);background:var(--yl)}
          .chip.selected{border-color:var(--yd);background:var(--yl);color:var(--yd);font-weight:500}
          .inp-area{padding:8px 20px 12px;background:#fff;border-top:1px solid var(--border);flex-shrink:0}
          .inp-wrap{display:flex;gap:8px;align-items:flex-end;background:var(--bg);border-radius:10px;padding:8px 12px;border:1px solid var(--border);transition:.12s}
          .inp-wrap:focus-within{border-color:var(--yd);background:#fff}
          textarea{flex:1;border:none;background:transparent;outline:none;font-family:'Inter',sans-serif;font-size:13px;color:var(--text);resize:none;max-height:100px;min-height:20px;line-height:1.5}
          .send{width:32px;height:32px;border-radius:7px;background:var(--y);border:none;cursor:pointer;font-size:16px;color:#1a1a1a;flex-shrink:0;transition:.12s}
          .send:hover{background:var(--yd);color:#fff}
          .send:disabled{opacity:.3;cursor:not-allowed}
          .result-wrap{display:flex;flex-direction:column;flex:1;overflow:hidden}
          .result-hd{padding:16px 20px;border-bottom:1px solid var(--border);background:#fff;flex-shrink:0}
          .result-hd h2{font-family:'Unbounded',sans-serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px}
          .result-hd p{font-size:12px;color:var(--text2)}
          .result-actions{display:flex;gap:8px;margin-top:10px}
          .btn-y{padding:7px 14px;border-radius:7px;background:var(--y);border:none;cursor:pointer;font-size:12px;font-weight:600;color:#1a1a1a;transition:.12s}
          .btn-y:hover{background:var(--yd);color:#fff}
          .btn-ghost{padding:7px 14px;border-radius:7px;background:var(--bg);border:1px solid var(--border);cursor:pointer;font-size:12px;color:var(--text2);transition:.12s}
          .btn-ghost:hover{color:var(--text)}
          .saved-badge{font-size:11px;color:var(--yd);display:flex;align-items:center;gap:4px;padding:7px 0}
          .result-body{flex:1;overflow-y:auto;padding:20px}
          .result-content{background:#fff;border-radius:10px;border:1px solid var(--border);padding:20px;font-size:13px;line-height:1.8;white-space:pre-wrap}
          .block-title{font-family:'Unbounded',sans-serif;font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--yd);margin:16px 0 6px;padding-top:14px;border-top:1px dashed var(--border);display:block}
          .block-title:first-child{border-top:none;margin-top:0;padding-top:0}
          .result-meta{font-size:11px;color:var(--text3);margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border)}
          .sidebar-user{padding:10px 14px;font-size:11px;color:var(--text2);border-bottom:1px solid var(--border);background:var(--yl)}
          .sidebar-user strong{color:var(--yd);font-weight:600}
        `}</style>
      </Head>
      <header>
        <div className="logo"><span className="logo-dot" />Lemana PRO</div>
        <span className="badge">Сбор требований · Бесконечная лента</span>
      </header>
      <div className="layout">
        <div className="sidebar">
          <div className="sidebar-user"><strong>{userName}</strong> · {userStatus}</div>
          <div className="sidebar-hd">Ваша роль</div>
          {ROLES.map(r => (
            <button key={r.id} className={`role-btn${role === r.id ? ' active' : ''}`} onClick={() => setRole(r.id)}>
              <div className="role-name">{r.name}</div>
              <div className="role-desc">{r.desc}</div>
            </button>
          ))}
          <div className="sep" />
          {screen === 'start' ? (
            <button className="start-btn" style={{margin:'12px 14px',width:'calc(100% - 28px)'}} onClick={startInterview}>Начать →</button>
          ) : (
            <button onClick={reset} style={{margin:'12px 14px',width:'calc(100% - 28px)',padding:'8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',fontSize:'12px',color:'var(--text2)'}}>↩ Начать заново</button>
          )}
          {screen !== 'start' && <>
            <div className="sep" />
            <div className="prog-hd">Прогресс</div>
            {TOPICS.map((t, i) => (
              <div key={t.id} className={`topic${i < topicIdx ? ' done' : i === topicIdx ? ' active' : ''}`}>
                <div className="tdot" />{t.e} {t.label}
              </div>
            ))}
          </>}
        </div>
        <div className="chat">
          {screen === 'start' && (
            <div className="start">
              <h1>Сбор требований<br /><span>ленты вдохновения</span></h1>
              <p>Агент проведёт структурированное интервью по 5 темам и сформирует конспект для BRD.</p>
              <div className="start-note">Выберите роль слева, затем начните интервью</div>
              <button className="start-btn" onClick={startInterview}>Начать интервью →</button>
            </div>
          )}
          {screen === 'chat' && <>
            <div className="msgs">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="av">{m.role === 'agent' ? '🏠' : 'Я'}</div>
                  <div className="bub">{m.text}</div>
                </div>
              ))}
              {busy && <div className="typing"><div className="td" /><div className="td" /><div className="td" /></div>}
              <div ref={msgsEndRef} />
            </div>
            <div className="chips">
              {chips.map((chip, i) => (
                <button key={i} className={`chip${input.includes(chip) ? ' selected' : ''}`}
                  onClick={() => setInput(prev => {
                    if (prev.includes(chip)) return prev.replace(', ' + chip, '').replace(chip + ', ', '').replace(chip, '').trim();
                    return prev ? prev + ', ' + chip : chip;
                  })}>
                  {chip}
                </button>
              ))}
            </div>
            <div className="inp-area">
              <div className="inp-wrap">
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Введите ответ..." rows={1}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }} />
                <button className="send" onClick={send} disabled={busy}>→</button>
              </div>
            </div>
          </>}
          {screen === 'result' && (
            <div className="result-wrap">
              <div className="result-hd">
                <h2>Конспект требований готов</h2>
                <p>Сохранён в Google Sheets · Скопируйте для передачи PM-у</p>
                <div className="result-actions">
                  <button className="btn-y" onClick={copyResult}>📋 Скопировать</button>
                  <button className="btn-ghost" onClick={reset}>↩ Новое интервью</button>
                  {saved && <span className="saved-badge">✓ Сохранено в таблицу</span>}
                </div>
              </div>
              <div className="result-body">
                <div className="result-content">
                  <div className="result-meta">
                    Проект: Бесконечная лента · Lemana PRO{'\n'}
                    Роль: {ROLE_NAMES[role]} · {userName} ({userStatus}){'\n'}
                    Дата: {new Date().toLocaleDateString('ru-RU')}
                  </div>
                  {summary.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) return <span key={i} className="block-title">{line.replace('### ', '')}</span>;
                    return <span key={i}>{line}{'\n'}</span>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
