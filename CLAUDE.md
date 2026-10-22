@README.md

# Нормы кода

Что за проект и как его запустить — в README выше. Здесь правила, по которым пишется код. Почему
они такие — в `docs/adr/`, правила предметной области — в `docs/domain/`. Перед изменением
архитектуры прочитай нужный ADR; меняется решение — пиши новый ADR, а не правь старый.

Пометка «не реализовано» в ADR и `docs/domain/` значит: описано целевое поведение, код ему пока не
соответствует. Не опирайся на такое утверждение как на факт о коде. Ход работ по этим расхождениям —
`docs/domain-migration.md`.

## Проверки

- `pnpm typecheck` — после каждого блока правок.
- `pnpm test` — если менялся `packages/domain` (тесты пока только там).
- `pnpm check` (format + lint + typecheck) — перед коммитом.
- `pnpm --filter @family-budget/domain test:mutation` — вручную, пока идут этапы 4–6
  `docs/domain-migration.md` (правка расчёта или его тестов). Выживший мутант сверх списка
  эквивалентных в `stryker.config.mjs` — место, которое тесты не проверяют. После этапа 6 Stryker
  удаляется.
- Всё, что ходит в БД (`dev`, миграции, `db:generate`), — только через `just`, иначе нет
  `DATABASE_URL` нужной роли.
- Документация Next — `apps/web/node_modules/next/dist/docs/`. В 16.x много нового, по памяти не
  писать.

## Тесты

Тест проверяет, как код должен работать, а не как он написан. Поэтому главное — откуда берётся
ожидаемое значение (оракул). Эталон — `monthly-budget.calculation.test.ts`.

- Ожидаемое значение считается вручную по правилам `docs/domain/` и записывается туда же
  пронумерованным примером с ходом расчёта (`distribution.md`, П1–П21). Тест ссылается на номер в
  названии (`'П4 — …'`), расчёт в комментарии теста не повторяется. Получать ожидаемое значение
  запуском кода нельзя; меняется правило — сначала пересчитывается пример, потом тест.
- Комментарии в коде и тестах — только короткое «почему» в одну строку. Правила и их пересказ
  живут в `docs/domain/`, код ссылается на раздел.
- Снимки (`toMatchSnapshot`, `toMatchInlineSnapshot`) не бывают единственным оракулом: снимок из
  кода закрепляет и его ошибки.
- Свойства (`fast-check`) — только те, что следуют из спецификации, а не повторяют строку
  реализации. Сильнее всего сравнение с моделью (точный расчёт без округления) и метаморфные
  свойства («связанные входы — связанные результаты»).
- У генератора, нацеленного на границу правила, есть проверка, что он в неё попадает: свойство,
  которое ни разу не выполнило ветку, о ней ничего не говорит.
- Ошибки на границе с БД (транзакции, `version`, каскады) ловят только тесты сервиса на настоящем
  Postgres, а не юнит-тесты domain.

## Слои и импорты (ADR-0001)

```
app          → features (index), components, client (index модулей, <m>/server, core, container,
               request-context), lib (clock, i18n; сервисы — только в route handlers)
features/<f> → client (index модулей, core, container, hydration-boundary, month-param),
               components, domain, ui, lib/i18n
components   → client/core, domain, ui, lib/i18n
client/<m>   → client/core, domain; @/lib — только из <m>.actions.ts и <m>/server.ts
client/core  → domain
lib          → domain, database
```

- Разрешено только перечисленное. `@/routes` можно отовсюду.
- Фичи не импортируют друг друга: общее поднимается в `client/` (данные, URL) или `components/`
  (UI).
- `packages/database` импортирует enum'ы из `domain`, не наоборот. `packages/ui` внутри — только
  относительные импорты.

## Данные

- Через границу сервер → клиент идут только примитивы (ADR-0009): деньги — decimal-строка,
  арифметика — только функциями `money.ts`; даты — `'2026-08-10'`; месяц — всегда первое число,
  тип `Period`.
- Календарные функции — только из `@family-budget/domain/shared`. «Сегодня» — `getCurrentPeriod()`
  на сервере; клиент `new Date()` для периода не зовёт.
- Контракт (`MonthlyBudget`) живёт на клиенте только в кэше `QueryClient`. В модель фичи серверные
  данные не копируются (ADR-0003).
- Модуль `domain`: `<m>.contract.ts` (zod-схемы и типы), `<m>.enums.ts`, `<m>.errors.ts`,
  `<m>.events.ts`, `<m>.calculation.ts` (расчёты для обеих сторон), `index.ts` без `export *`.
- Выходная схема выводится из входной (`fieldsSchema.extend({ id, … })`). Zod — только когда есть
  инвариант строже БД; простой набор полей — обычный `type`.
- Форма берёт схему из `domain`, ту же, что валидирует вход экшена. Своих схем в форме нет.

## Сервер: `apps/web/lib/<module>`

- Наружу — только `<module>Service` из `index.ts`. `queries/`, `mutations/` и мапперы приватны.
- Каждая запись принимает `tx: Executor = db`.
- Мапперы чистые: не ходят в БД, не сортируют, на выходе `assertContract(schema, dto, label)`.
- После записи агрегат перечитывается в той же транзакции тем же кодом, что у GET.
- Мутация бюджета атомарно увеличивает `version` (`set version = version + 1`) и публикует событие
  (ADR-0007). Это касается и создания. Существующий код этому пока не следует (ADR-0007, «Не
  реализовано»); новый код пиши по правилу.
- Текст ошибки для пользователя — только наследник `DomainError`, на русском. Остальное
  маскируется.
- Процессные синглтоны (шина событий) — в `globalThis`.

## Транспорт (ADR-0002)

- Чтение — route handler в `app/api/...` через `familyRoute(schema, handler)`, хендлер в одну
  строку, логика в `lib`.
- Запись — Server Action через `familyActionClient`. `requireUser()`/`requireFamily()` в экшенах
  не звать: это гарды страниц, они делают `redirect()`.
- Предзагрузка на странице — сервисом напрямую через `client/<m>/server.ts`.

## Клиентский модуль: `apps/web/client/<module>`

```
<m>.actions.ts    'use server', только запись
<m>.read.ts       fetchX(key, signal) через fetchJson
<m>.cache.ts      ключи, правило свежести, XCache
<m>.queries.ts    XQuery extends ResourceQuery
<m>.commands.ts   класс на сценарий записи (MutationCommand), onDone → cache.write
<m>.live-sync.ts  одно SSE на вкладку
server.ts         предзагрузка для app/
index.ts          всё, что видно снаружи
```

- Чтение бросает `ClientError`, команда возвращает `CommandResult` и не бросает никогда.
- Правило свежести одно: побеждает `version >=`. Одна функция, её используют кэш, команды,
  live-sync и `HydrationBoundary`. В `queryClient` руками лезут только кэш и live-sync.
- Наружу — только `index.ts` (и `server.ts` для `app/`). Ключи, `fetchX` и экшены не экспортируются.
- `client/core` ничего не знает о модулях.

## Фича: `apps/web/features/<f>` (эталон — `monthly-budget`, ADR-0003)

```
index.ts               корень фичи и индикатор загрузки; связанные виджеты не экспортируются
<f>.tsx                HydrationBoundary(snapshot) → ScopeProvider → Gate
<x>-scope.ts           createXAdapters (client/*) + createXScope (только порты), ADR-0004
<x>-scope.context.tsx  провайдер, useXScope, useReady, useReadyVM, useScopeVM
model/                 ports.ts, <x>.model.ts (единственный стор), <x>.snapshot.ts, locks.ts …
components/screen/     Gate, ReadyGate, карточки экрана, индикатор загрузки
components/<виджет>/   .view.ts (buildXView), .vm.ts, .form.ts, .widget.tsx (vm пропсом), .tsx (связанный)
```

- Один стор на фичу; в нём только выбор пользователя. Всё остальное — `@computed`.
- В VM нет `@observable`: состояние одного виджета — `useState`, общее — модель.
- Корень фичи принимает обязательный `snapshot: DehydratedState` и сам ставит `HydrationBoundary`:
  всё, что создаёт `Query`, должно быть ниже границы, иначе SSR отдаст заглушку.
- `ReadyGate` монтируется с `key={period}`; намерения берут `ready.period`.
- Создание в `useState` без подписок, `activate()` в `useEffect`, `destroy` нет (ADR-0005).
- Блокировка считается в snapshot. View объясняет её заранее, VM возвращает её через `guarded`.
  Каждое серверное условие отказа повторено клиентской блокировкой. Для закрытия месяца не
  реализовано: `closeBlockerOf` не знает про пустой состав и перерасход (`docs/domain/rules.md`).
- Компонент не пишет `try/catch`: ошибка чтения — в `model.state`, ошибка команды —
  `applyCommandError(form, error)`.
- `switch` по `status` без `default`.
- Индикатор загрузки один на экран (спиннер); у виджетов нет веток `loading` и скелетонов.
- `observer` рендерится только под `ClientProvider` (`app/(internal)/layout.tsx`).

Периферийные экраны без расчётов и живой синхронизации (настройки, категории) можно делать проще:
серверный компонент читает данные сервисом, форма вызывает команду из `client/<m>`.

## Страницы: `apps/web/app/*`

- Канонический URL наводит `proxy.ts` до рендера. Месяц — `?period=YYYY-MM`, всегда (ADR-0006).
- Страница: гарды → `toViewer` → `today` и разбор `searchParams` → шапка → `<Suspense>` вокруг
  async-компонента, который делает `prefetchQuery` и отдаёт `<X snapshot={dehydrate(qc)} />`.
- `initialData` в фичу не передавать.
- В `?period=` пишет только `features/month-navigation` (`history.pushState`). Читают через
  `useSelectedPeriod`.

## Как добавить операцию

1. `domain`: схема входа, отказ — наследник `DomainError`, общий расчёт — в `<m>.calculation.ts`.
2. `lib/<m>`: мутация, сценарий в `service.ts`, перечитывание агрегата, `version`, событие.
3. `client/<m>`: экшен, класс команды, строка в `index.ts`. Для чтения — хендлер в `app/api`,
   `fetchX`, `XQuery`, предзагрузка в `server.ts`.
4. `features/<f>`: поле в адаптерах, при необходимости поле snapshot, папка виджета.
5. `pnpm typecheck`, `pnpm lint`.

## Не делать

- звать экшен или `fetch` из компонента или VM;
- заводить ключи кэша в фиче или второй `QueryClient` / `LiveSync`;
- копировать серверные данные в модель;
- импортировать `client/*` глубже `index.ts`;
- использовать stage-3 декораторы: MobX-код на legacy (`experimentalDecorators`), пока
  `mobx-tanstack-query` требует `mobx ^6`;
- запускать больше одного экземпляра `web` (ADR-0008).

## Старый код

Фичи `budget-category`, `family-settings`, `family-invitation-code`, `create-family-wizard`, а
также `app/auth`, `app/(internal)/accept-invite` и `components/{flash-cleaner,sidebar}` написаны
до появления `client/`: экшены и сервисы лежат прямо у них. Новый код по ним не писать; при
содержательной правке переносить в `client/<m>`.
