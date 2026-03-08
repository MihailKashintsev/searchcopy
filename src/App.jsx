import { useState, useEffect, useRef } from "react";

import { getVersion } from "@tauri-apps/api/app";

const [VERSION, setVERSION] = useState("...");
useEffect(() => {
  getVersion().then(setVERSION);
}, []);

// ─── База знаний ─────────────────────────────────────────────────────────────
const DB = {
  Excel: [
    { id: 1,  keys: "SUM",       type: "formula", template: "=SUM({col}:{col})",          example: "=SUM(A:A)",          desc: "Сумма столбца",                  tags: ["сумма","посчитать","столбец","итого","сложить","подсчитать"] },
    { id: 2,  keys: "AVERAGE",   type: "formula", template: "=AVERAGE({col}:{col})",       example: "=AVERAGE(A:A)",       desc: "Среднее значение",               tags: ["среднее","average","средний"] },
    { id: 3,  keys: "VLOOKUP",   type: "formula", template: "=VLOOKUP({col}2,B:C,2,0)",   example: "=VLOOKUP(A2,B:C,2,0)",desc: "Поиск значения по столбцу",      tags: ["найти","поиск","vlookup","подтянуть","справочник"] },
    { id: 4,  keys: "IF",        type: "formula", template: '=IF({col}1>0,"Да","Нет")',   example: '=IF(A1>0,"Да","Нет")',desc: "Логическое условие",             tags: ["если","условие","if","логика","проверить"] },
    { id: 5,  keys: "COUNTIF",   type: "formula", template: '=COUNTIF({col}:{col},"*")',  example: '=COUNTIF(A:A,"да")',  desc: "Подсчёт ячеек по условию",       tags: ["посчитать","количество","countif","сколько раз"] },
    { id: 6,  keys: "SUMIF",     type: "formula", template: '=SUMIF({col}:{col},"условие",B:B)', example: '=SUMIF(A:A,"да",B:B)', desc: "Сумма по условию",       tags: ["сумма с условием","sumif","выборочная сумма"] },
    { id: 7,  keys: "MAX / MIN", type: "formula", template: "=MAX({col}:{col})",           example: "=MAX(A:A)",           desc: "Максимальное значение",          tags: ["максимум","минимум","max","min","наибольший"] },
    { id: 8,  keys: "ROUND",     type: "formula", template: "=ROUND({col}1,2)",            example: "=ROUND(A1,2)",        desc: "Округление числа",               tags: ["округлить","round","округление"] },
    { id: 9,  keys: "IFERROR",   type: "formula", template: '=IFERROR({col}1,"—")',        example: '=IFERROR(A1,"—")',    desc: "Скрыть ошибку в формуле",        tags: ["ошибка","скрыть ошибку","iferror"] },
    { id: 10, keys: "INDEX+MATCH",type:"formula", template: "=INDEX(B:B,MATCH({col}2,A:A,0))", example: "=INDEX(B:B,MATCH(A2,A:A,0))", desc: "Гибкий поиск (лучше VLOOKUP)", tags: ["найти","поиск","index match","гибкий поиск"] },
    { id: 11, keys: "CONCATENATE",type:"formula", template: '={col}1&" "&{col}2',         example: '=A1&" "&B1',          desc: "Объединить текст из ячеек",      tags: ["объединить","склеить","текст","соединить"] },
    { id: 12, keys: "TODAY",     type: "formula", template: "=TODAY()",                    example: "=TODAY()",            desc: "Текущая дата",                   tags: ["дата","сегодня","today","текущая дата"] },
    { id: 13, keys: "LEN",       type: "formula", template: "=LEN({col}1)",                example: "=LEN(A1)",            desc: "Длина текста в ячейке",          tags: ["длина","символы","len","текст"] },
    { id: 20, keys: "Alt + =",           type: "hotkey", desc: "Автосумма выделенного диапазона", tags: ["автосумма","сумма","autosum","быстрая сумма"] },
    { id: 21, keys: "Ctrl + Shift + L",  type: "hotkey", desc: "Включить / выключить фильтр",     tags: ["фильтр","filter","включить фильтр"] },
    { id: 22, keys: "Ctrl + T",          type: "hotkey", desc: "Создать умную таблицу",            tags: ["таблица","умная таблица","создать таблицу"] },
    { id: 23, keys: "F4",                type: "hotkey", desc: "Переключить тип ссылки ($A$1)",    tags: ["закрепить","абсолютная ссылка","$","fix"] },
    { id: 24, keys: "Ctrl + 1",          type: "hotkey", desc: "Открыть «Формат ячеек»",           tags: ["формат","формат ячеек","форматировать"] },
    { id: 25, keys: "Ctrl + Shift + +",  type: "hotkey", desc: "Вставить строку / столбец",        tags: ["добавить строку","вставить строку","новая строка"] },
    { id: 26, keys: "Ctrl + -",          type: "hotkey", desc: "Удалить строку / столбец",         tags: ["удалить строку","удалить столбец"] },
    { id: 27, keys: "Ctrl + F",          type: "hotkey", desc: "Найти в документе",                tags: ["найти","поиск","find"] },
    { id: 28, keys: "Ctrl + H",          type: "hotkey", desc: "Найти и заменить",                 tags: ["заменить","replace","найти и заменить"] },
    { id: 29, keys: "Ctrl + Z",          type: "hotkey", desc: "Отменить действие",                tags: ["отменить","undo","назад"] },
    { id: 30, keys: "Ctrl + S",          type: "hotkey", desc: "Сохранить файл",                   tags: ["сохранить","save"] },
  ],
  Word: [
    { id: 40, keys: "Ctrl + B / I / U",    type: "hotkey", desc: "Жирный / Курсив / Подчёркивание", tags: ["жирный","курсив","подчеркнуть","bold","форматирование"] },
    { id: 41, keys: "Ctrl + Enter",         type: "hotkey", desc: "Разрыв страницы",                 tags: ["новая страница","разрыв страницы"] },
    { id: 42, keys: "Ctrl + L / E / R / J", type: "hotkey", desc: "Выравнивание текста",             tags: ["выравнивание","по центру","по правому","justify"] },
    { id: 43, keys: "Ctrl + Alt + 1/2/3",  type: "hotkey", desc: "Стиль Заголовок 1/2/3",           tags: ["заголовок","стиль","heading","h1","h2"] },
    { id: 44, keys: "Ctrl + D",             type: "hotkey", desc: "Диалог «Шрифт»",                  tags: ["шрифт","размер шрифта","font"] },
    { id: 45, keys: "Ctrl + F",             type: "hotkey", desc: "Найти в документе",               tags: ["найти","поиск","find"] },
    { id: 46, keys: "Ctrl + Z",             type: "hotkey", desc: "Отменить действие",               tags: ["отменить","undo"] },
  ],
  PowerPoint: [
    { id: 50, keys: "F5",         type: "hotkey", desc: "Запустить показ с начала",       tags: ["показ","запустить","слайд шоу","презентация","play"] },
    { id: 51, keys: "Shift + F5", type: "hotkey", desc: "Показ с текущего слайда",        tags: ["показ","текущий слайд"] },
    { id: 52, keys: "Ctrl + M",   type: "hotkey", desc: "Добавить новый слайд",           tags: ["новый слайд","добавить слайд","слайд"] },
    { id: 53, keys: "Ctrl + D",   type: "hotkey", desc: "Дублировать слайд / объект",     tags: ["дублировать","копия слайда","duplicate"] },
    { id: 54, keys: "Ctrl + G",   type: "hotkey", desc: "Группировать объекты",           tags: ["группировать","группа","group"] },
    { id: 55, keys: "Ctrl + Z",   type: "hotkey", desc: "Отменить действие",              tags: ["отменить","undo"] },
  ],
  "VS Code": [
    { id: 60, keys: "Ctrl + P",         type: "hotkey", desc: "Быстро открыть файл",            tags: ["найти файл","открыть файл","quick open"] },
    { id: 61, keys: "Ctrl + Shift + P", type: "hotkey", desc: "Командная палитра",               tags: ["команда","palette","меню команд"] },
    { id: 62, keys: "Alt + ↑ / ↓",     type: "hotkey", desc: "Переместить строку вверх/вниз",   tags: ["переместить строку","двигать строку","move line"] },
    { id: 63, keys: "Ctrl + /",         type: "hotkey", desc: "Закомментировать строку",         tags: ["комментарий","закомментировать","comment"] },
    { id: 64, keys: "Ctrl + D",         type: "hotkey", desc: "Выделить следующее вхождение",    tags: ["мультикурсор","выделить слово","multi cursor"] },
    { id: 65, keys: "Ctrl + `",         type: "hotkey", desc: "Открыть терминал",                tags: ["терминал","terminal","консоль","открыть терминал"] },
    { id: 66, keys: "Ctrl + Shift + K", type: "hotkey", desc: "Удалить строку",                  tags: ["удалить строку","delete line"] },
    { id: 67, keys: "Ctrl + B",         type: "hotkey", desc: "Скрыть / показать боковую панель",tags: ["боковая панель","sidebar","скрыть панель"] },
    { id: 68, keys: "Ctrl + Z",         type: "hotkey", desc: "Отменить действие",               tags: ["отменить","undo"] },
  ],
  Photoshop: [
    { id: 70, keys: "Ctrl + J",             type: "hotkey", desc: "Дублировать слой",                 tags: ["дублировать слой","скопировать слой","duplicate"] },
    { id: 71, keys: "Ctrl + T",             type: "hotkey", desc: "Свободная трансформация",          tags: ["трансформация","transform","масштаб","повернуть"] },
    { id: 72, keys: "[ / ]",               type: "hotkey", desc: "Уменьшить / увеличить кисть",      tags: ["кисть","размер кисти","brush size"] },
    { id: 73, keys: "Ctrl + Alt + Z",       type: "hotkey", desc: "Несколько шагов назад (история)",  tags: ["история","отменить несколько","много шагов"] },
    { id: 74, keys: "Ctrl + Shift + S",     type: "hotkey", desc: "Сохранить как",                    tags: ["сохранить как","save as","экспорт"] },
    { id: 75, keys: "Ctrl + Shift + Alt+E", type: "hotkey", desc: "Объединить видимые слои в новый",  tags: ["объединить слои","stamp","flatten"] },
  ],
};

const PROGRAMS = Object.keys(DB);
const COLORS = { Excel:"#22c55e", Word:"#3b82f6", PowerPoint:"#f97316", "VS Code":"#a78bfa", Photoshop:"#38bdf8" };
const ICONS  = { Excel:"⊞", Word:"W", PowerPoint:"P", "VS Code":"</>", Photoshop:"Ps" };

// ─── Извлечение столбцов Excel из запроса ────────────────────────────────────
function extractColumns(q) {
  const parts = q.toUpperCase().split(/[\s,+иand&]+/);
  const cols = [];
  for (const p of parts) {
    if (/^[A-Z]{1,2}$/.test(p.trim())) cols.push(p.trim());
  }
  return [...new Set(cols)];
}

// ─── Поиск ───────────────────────────────────────────────────────────────────
function score(query, item) {
  const q = query.toLowerCase().trim();
  let s = 0;
  const fields = [item.desc.toLowerCase(), item.keys.toLowerCase(), ...(item.tags || [])];
  for (const f of fields) {
    if (f === q) { s += 10; continue; }
    if (f.includes(q)) { s += 5; continue; }
    for (const w of q.split(/[\s,]+/)) {
      if (w.length > 2 && f.includes(w)) s += 2;
    }
  }
  return s;
}

function doSearch(query, programs) {
  if (query.trim().length < 2) return [];
  const out = [];
  for (const prog of programs) {
    for (const item of DB[prog] || []) {
      const s = score(query, item);
      if (s > 0) out.push({ ...item, program: prog, score: s });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 14);
}

// ─── Построение цепочки ──────────────────────────────────────────────────────
function buildChain(query, items) {
  const cols = extractColumns(query);
  if (cols.length < 2) return null;

  // Ищем формулу с template
  const base = items.find(i => i.template) || items[0];
  if (!base) return null;

  return cols.map((col, i) => {
    let formula = "";
    if (base.template) {
      formula = base.template.replace(/\{col\}/g, col);
    } else {
      formula = base.example || base.keys;
    }
    return { step: i + 1, col, formula, desc: base.desc, program: base.program };
  });
}

// ─── CopyBtn ─────────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }}
      title="Копировать"
      style={{
        background: ok ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${ok ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.12)"}`,
        color: ok ? "#4ade80" : "#64748b",
        borderRadius: "7px", padding: "5px 11px",
        fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
        fontWeight: "700", transition: "all 0.18s", flexShrink: 0,
      }}>
      {ok ? "✓" : "⎘"}
    </button>
  );
}

// ─── ChainCard ───────────────────────────────────────────────────────────────
function ChainCard({ chain }) {
  const prog = chain[0]?.program || "Excel";
  const color = COLORS[prog] || "#818cf8";
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "rgba(12,10,28,0.97)",
      border: "1px solid rgba(139,92,246,0.35)",
      borderRadius: "14px", padding: "18px 20px", marginBottom: "10px",
      animation: "fadeUp 0.3s ease both",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,#7c3aed,#4f46e5,#0ea5e9)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
        <div style={{
          background:"linear-gradient(135deg,rgba(124,58,237,0.25),rgba(79,70,229,0.25))",
          border:"1px solid rgba(139,92,246,0.5)", borderRadius:"8px",
          padding:"4px 12px", fontSize:"10px", color:"#c4b5fd",
          fontWeight:"800", textTransform:"uppercase", letterSpacing:"1.5px",
          display:"flex", alignItems:"center", gap:"6px",
        }}>
          <span>⛓</span> Цепочка действий
        </div>
        <span style={{ fontSize:"11px", color:"#475569" }}>{chain.length} шага</span>
      </div>

      {/* Steps */}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {chain.map((step) => (
          <div key={step.step} style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
            <div style={{
              width:"28px", height:"28px", borderRadius:"50%", flexShrink:0, marginTop:"2px",
              background:`${color}20`, border:`1.5px solid ${color}60`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"12px", color:color, fontWeight:"800",
            }}>{step.step}</div>

            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px", flexWrap:"wrap" }}>
                <span style={{
                  background:"rgba(99,102,241,0.18)", border:"1px solid rgba(99,102,241,0.4)",
                  borderRadius:"6px", padding:"3px 10px",
                  fontSize:"12px", color:"#c7d2fe", fontWeight:"700",
                }}>столбец {step.col}</span>
                <span style={{ fontSize:"11px", color:"#475569" }}>{step.desc}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{
                  background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.3)",
                  borderRadius:"8px", padding:"8px 14px",
                  fontSize:"13px", color:"#bae6fd", fontWeight:"700",
                  flex:1, wordBreak:"break-all", letterSpacing:"0.3px",
                }}>
                  {step.formula}
                </div>
                <CopyBtn text={step.formula} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Copy all */}
      <div style={{ marginTop:"14px", paddingTop:"12px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"10px", color:"#334155" }}>Скопировать все формулы</span>
        <CopyBtn text={chain.map(s => s.formula).join("\n")} />
      </div>
    </div>
  );
}

// ─── ResultCard ──────────────────────────────────────────────────────────────
function ResultCard({ item, idx, detectedCols }) {
  const color = COLORS[item.program] || "#818cf8";
  let display = item.example || "";
  let adapted = false;
  if (item.template && detectedCols.length > 0) {
    display = item.template.replace(/\{col\}/g, detectedCols[0]);
    adapted = true;
  }

  return (
    <div style={{
      background:"rgba(12,12,22,0.92)",
      border:`1px solid rgba(255,255,255,0.06)`,
      borderLeft:`3px solid ${color}`,
      borderRadius:"12px", padding:"14px 18px",
      display:"flex", alignItems:"flex-start", gap:"14px",
      animation:`fadeUp 0.3s ease ${idx*0.04}s both`,
    }}>
      <div style={{
        background:`${color}14`, border:`1px solid ${color}40`,
        borderRadius:"7px", padding:"3px 8px",
        fontSize:"10px", color, fontWeight:"800",
        textTransform:"uppercase", whiteSpace:"nowrap", marginTop:"2px", letterSpacing:"0.3px",
      }}>
        {ICONS[item.program]} {item.program}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", flexWrap:"wrap", marginBottom:"5px" }}>
          <span style={{
            background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)",
            borderRadius:"6px", padding:"3px 10px",
            fontSize:"13px", color:"#c7d2fe", fontWeight:"700",
          }}>{item.keys}</span>
          <span style={{
            fontSize:"10px", padding:"2px 8px", borderRadius:"999px",
            background: item.type==="formula" ? "rgba(34,197,94,0.1)"  : "rgba(251,191,36,0.1)",
            border:     item.type==="formula" ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(251,191,36,0.25)",
            color:      item.type==="formula" ? "#4ade80" : "#fbbf24",
          }}>{item.type==="formula" ? "📊 Формула" : "⌨️ Клавиша"}</span>
          {adapted && (
            <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"999px", background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.3)", color:"#38bdf8" }}>
              ✦ Адаптировано
            </span>
          )}
        </div>

        <p style={{ margin:"0 0 7px", color:"#64748b", fontSize:"12px" }}>{item.desc}</p>

        {display && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{
              background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"7px", padding:"6px 12px",
              fontSize:"12px", color:"#93c5fd", flex:1,
              wordBreak:"break-all", fontWeight:"600",
            }}>{display}</div>
            <CopyBtn text={display} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AboutTab ────────────────────────────────────────────────────────────────
function AboutTab() {
  const InfoRow = ({ icon, title, body }) => (
    <div style={{ display:"flex", gap:"14px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"14px 16px", marginBottom:"8px" }}>
      <span style={{ fontSize:"20px", flexShrink:0, lineHeight:1, marginTop:"1px" }}>{icon}</span>
      <div>
        <div style={{ fontSize:"12px", fontWeight:"700", color:"#c7d2fe", marginBottom:"5px" }}>{title}</div>
        <div style={{ fontSize:"12px", color:"#64748b", lineHeight:"1.65" }}>{body}</div>
      </div>
    </div>
  );

  const ErrRow = ({ title, fix }) => (
    <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:"10px", padding:"14px 16px", marginBottom:"8px" }}>
      <div style={{ fontSize:"12px", fontWeight:"700", color:"#fca5a5", marginBottom:"5px" }}>⚠ {title}</div>
      <div style={{ fontSize:"12px", color:"#64748b", lineHeight:"1.65" }}>{fix}</div>
    </div>
  );

  const Heading = ({ t }) => (
    <p style={{ color:"#334155", fontSize:"10px", textTransform:"uppercase", letterSpacing:"2px", fontWeight:"800", margin:"24px 0 10px" }}>{t}</p>
  );

  return (
    <div style={{ animation:"fadeUp 0.35s ease both" }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,rgba(79,70,229,0.1),rgba(14,165,233,0.07))", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"16px", padding:"24px", textAlign:"center", marginBottom:"6px" }}>
        <div style={{ fontSize:"32px", marginBottom:"10px" }}>⌘</div>
        <h2 style={{ margin:"0 0 5px", fontSize:"20px", fontWeight:"900", color:"#e2e8f0", letterSpacing:"-0.5px" }}>SearchCopy</h2>
        <p style={{ margin:"0 0 10px", color:"#818cf8", fontSize:"10px", letterSpacing:"2.5px", textTransform:"uppercase" }}>by RENDERGAMES</p>
        <p style={{ margin:0, color:"#475569", fontSize:"12px", lineHeight:"1.6" }}>Ищи горячие клавиши и формулы на русском — просто напиши что хочешь сделать.</p>
      </div>

      <Heading t="Как пользоваться поиском" />
      <InfoRow icon="🔍" title="Пиши по-русски, как обычно" body='Введи в строку поиска что хочешь сделать: "посчитать сумму", "удалить строку", "найти значение". Приложение само найдёт нужные формулы и горячие клавиши.' />
      <InfoRow icon="⛓" title="Цепочки действий" body='Укажи несколько столбцов — получишь цепочку. Например: "посчитай столбец G и B" выдаст =SUM(G:G) и =SUM(B:B) по отдельности с тегом «Цепочка действий».' />
      <InfoRow icon="✦" title="Адаптация под твои столбцы" body='Напиши "сумма столбца C" — формула подстроится как =SUM(C:C). Такие результаты помечены тегом «Адаптировано».' />

      <Heading t="Фильтры по программам" />
      <InfoRow icon="🏷" title="Кнопки над строкой поиска" body="Выбирай нужные программы — поиск ведётся только по ним. Минимум одна всегда активна. По умолчанию — Excel." />

      <Heading t="Как читать результаты" />
      <InfoRow icon="📊" title='Тег «Формула»' body="Это формула Excel. Есть пример — нажми ⎘ рядом, чтобы скопировать и вставить в ячейку." />
      <InfoRow icon="⌨️" title='Тег «Клавиша»' body="Горячая клавиша. На Mac: Ctrl = Cmd. Нажми сочетание в нужном приложении." />

      <Heading t="Обновления" />
      <InfoRow icon="🔔" title="Автообновление" body="Когда выйдет новая версия — в правом нижнем углу появится баннер. Нажми «Установить» — приложение обновится и перезапустится само." />
      <InfoRow icon="🔄" title="Обновление не приходит?" body="Перезапусти приложение — оно проверяет обновления при каждом запуске. Если проблема осталась, скачай последнюю версию вручную с сайта." />

      <Heading t="Частые ошибки" />
      <ErrRow title="Ничего не найдено" fix='Попробуй переформулировать: вместо "calc" пиши "посчитать". Убедись, что нужная программа включена в фильтрах.' />
      <ErrRow title="Формула выглядит странно" fix='Если в запросе нет конкретного столбца — подставляется стандартный пример. Просто замени "A:A" на нужный столбец.' />
      <ErrRow title='Кнопка "Копировать" не работает' fix="Браузер мог заблокировать доступ к буферу. В десктопной версии (.dmg / .exe) этой проблемы нет." />

      <div style={{ textAlign:"center", color:"#1e293b", fontSize:"10px", marginTop:"28px", paddingBottom:"8px" }}>RENDERGAMES © 2026</div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState([]);
  const [chain,    setChain]    = useState(null);
  const [progs,    setProgs]    = useState(["Excel"]);
  const [focused,  setFocused]  = useState(false);
  const [tab,      setTab]      = useState("search");
  const inputRef = useRef();

  useEffect(() => {
    if (query.trim().length > 1) {
      const res = doSearch(query, progs);
      setResults(res);
      setChain(buildChain(query, res));
    } else {
      setResults([]);
      setChain(null);
    }
  }, [query, progs]);

  const toggleProg = (p) =>
    setProgs(prev => prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p]);

  const suggestions = ["посчитай столбец G и B","найти значение","удалить строку","сумма столбца C","добавить слайд","терминал"];

  return (
    <div style={{ minHeight:"100vh", background:"#070710", fontFamily:"ui-monospace,'SF Mono',Menlo,monospace", color:"#e2e8f0", position:"relative", overflow:"hidden" }}>

      {/* Ambient glow */}
      <div style={{ position:"fixed", top:"-250px", left:"50%", transform:"translateX(-50%)", width:"900px", height:"500px", background:"radial-gradient(ellipse,rgba(79,70,229,0.13) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"-150px", right:"-80px", width:"450px", height:"350px", background:"radial-gradient(ellipse,rgba(14,165,233,0.07) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:"760px", margin:"0 auto", padding:"40px 20px 100px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"30px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.22)", borderRadius:"999px", padding:"5px 16px", marginBottom:"14px", fontSize:"10px", color:"#818cf8", letterSpacing:"2.5px", textTransform:"uppercase" }}>
            <span style={{ animation:"pulse 2.5s infinite" }}>●</span> RENDERGAMES
          </div>
          <h1 style={{ fontSize:"clamp(30px,6vw,48px)", fontWeight:"900", margin:"0 0 7px", background:"linear-gradient(135deg,#f1f5f9 0%,#c7d2fe 50%,#818cf8 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"-2px", lineHeight:1 }}>
            SearchCopy
          </h1>
          <p style={{ color:"#334155", fontSize:"11px", margin:0, letterSpacing:"0.5px" }}>Горячие клавиши · Формулы · Цепочки действий</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"4px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"4px", marginBottom:"22px" }}>
          {[{id:"search",label:"⌘ Поиск"},{id:"about",label:"◎ О приложении"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, background:tab===t.id?"rgba(99,102,241,0.18)":"transparent",
              border:tab===t.id?"1px solid rgba(99,102,241,0.35)":"1px solid transparent",
              borderRadius:"9px", padding:"9px 16px",
              fontSize:"12px", fontWeight:"700",
              color:tab===t.id?"#c7d2fe":"#475569",
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", letterSpacing:"0.3px",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── Search Tab ── */}
        {tab === "search" && (
          <div style={{ animation:"fadeUp 0.3s ease both" }}>

            {/* Program filters */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", justifyContent:"center", marginBottom:"18px" }}>
              {PROGRAMS.map(p => {
                const on = progs.includes(p);
                const c  = COLORS[p];
                return (
                  <button key={p} onClick={() => toggleProg(p)} style={{
                    background:on?`${c}16`:"rgba(255,255,255,0.03)",
                    border:`1px solid ${on?c+"70":"rgba(255,255,255,0.07)"}`,
                    color:on?c:"#475569", borderRadius:"999px", padding:"5px 14px",
                    fontSize:"11px", fontWeight:"700", cursor:"pointer",
                    transition:"all 0.18s", display:"flex", alignItems:"center", gap:"5px",
                    fontFamily:"inherit", letterSpacing:"0.3px",
                  }}>
                    <span style={{ fontSize:"10px" }}>{ICONS[p]}</span>{p}
                  </button>
                );
              })}
            </div>

            {/* Search input */}
            <div style={{ position:"relative", marginBottom:"16px", borderRadius:"14px", boxShadow:focused?"0 0 0 2px rgba(99,102,241,0.4),0 24px 60px rgba(0,0,0,0.55)":"0 8px 40px rgba(0,0,0,0.4)", transition:"box-shadow 0.3s" }}>
              <span style={{ position:"absolute", left:"18px", top:"50%", transform:"translateY(-50%)", fontSize:"17px", color:"#4f46e5", pointerEvents:"none", fontWeight:"700" }}>⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder='Например: "посчитай столбец G и B"...'
                style={{
                  width:"100%", boxSizing:"border-box",
                  background:"rgba(12,12,22,0.98)",
                  border:`1px solid ${focused?"rgba(99,102,241,0.55)":"rgba(255,255,255,0.07)"}`,
                  borderRadius:"14px", padding:"16px 46px 16px 48px",
                  fontSize:"15px", color:"#e2e8f0", outline:"none",
                  fontFamily:"inherit", transition:"border 0.25s",
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.07)", border:"none", color:"#64748b", width:"26px", height:"26px", borderRadius:"50%", cursor:"pointer", fontSize:"12px" }}>✕</button>
              )}
            </div>

            {/* Suggestions */}
            {!query && (
              <div style={{ marginBottom:"28px" }}>
                <p style={{ color:"#1e293b", fontSize:"10px", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"8px" }}>Попробуй:</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => { setQuery(s); inputRef.current?.focus(); }} style={{
                      background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
                      borderRadius:"7px", padding:"5px 11px", fontSize:"11px", color:"#475569",
                      cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.target.style.color="#a5b4fc"; e.target.style.borderColor="rgba(99,102,241,0.3)"; }}
                      onMouseLeave={e => { e.target.style.color="#475569"; e.target.style.borderColor="rgba(255,255,255,0.06)"; }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {(chain || results.length > 0) && (
              <div>
                <p style={{ color:"#1e293b", fontSize:"10px", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"12px" }}>
                  {chain ? `Цепочка + ${results.length} результатов` : `Найдено: ${results.length}`}
                </p>
                {chain && <ChainCard chain={chain} />}
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {results.map((item, i) => (
                    <ResultCard key={item.id} item={item} idx={i} detectedCols={extractColumns(query)} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {query.trim().length > 1 && !chain && results.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#1e293b" }}>
                <div style={{ fontSize:"36px", marginBottom:"12px", opacity:0.4 }}>⌕</div>
                <p style={{ margin:0, fontSize:"13px" }}>Ничего не найдено по «{query}»</p>
                <p style={{ margin:"6px 0 0", fontSize:"11px", color:"#0f172a" }}>Попробуй другие слова или включи больше программ</p>
              </div>
            )}
          </div>
        )}

        {/* ── About Tab ── */}
        {tab === "about" && <AboutTab />}
      </div>

      {/* Version badge */}
      <div style={{
        position:"fixed", bottom:"18px", right:"20px",
        background:"rgba(7,7,16,0.92)", border:"1px solid rgba(99,102,241,0.18)",
        borderRadius:"8px", padding:"5px 12px",
        fontSize:"10px", color:"#1e293b", fontFamily:"inherit",
        backdropFilter:"blur(12px)", zIndex:100,
        display:"flex", alignItems:"center", gap:"6px", letterSpacing:"0.5px",
      }}>
        <span style={{ color:"#4f46e5" }}>◆</span> SearchCopy v{VERSION}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input::placeholder { color:#1e293b; }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:4px; }
      `}</style>
    </div>
  );
}