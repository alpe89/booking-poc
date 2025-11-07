# 🎯 Quick Reference - Colloquio Lead Engineer

## 30-Second Pitch

> "Sistema di booking con gestione concorrenza tramite pessimistic locking, architettura monorepo type-safe end-to-end, 46 integration tests con PostgreSQL, CI/CD completo. Focus su pragmatismo: REST > GraphQL, pnpm workspaces > NX per velocity in POC."

---

## 🔑 Domande Più Probabili (Top 10)

### 1. Come gestisci race conditions?
**File:** `packages/backend/src/modules/booking/booking.service.ts:23-29`
```typescript
FOR UPDATE // Row-level pessimistic locking
```
**Trade-off:** Throughput vs consistency (scelto consistency)

### 2. Come funziona la scadenza carrello?
- Cron job ogni 6 ore: `booking-cleanup.service.ts:16`
- Check real-time alla conferma: `booking.service.ts:104-116`
- Calcolo availability esclude PENDING scaduti: `booking.service.ts:38-52`

### 3. Come testi la concorrenza?
**File:** `packages/backend/src/modules/booking/booking.controller.integration.spec.ts`
- Promise.all per richieste parallele
- PostgreSQL reale in CI/CD
- 46 integration tests

### 4. Perché NestJS?
- DI container built-in
- Structure conventions per team
- Testing utilities eccellenti
**Trade-off:** Overhead vs maintainability (team > 3 persone)

### 5. Come scaleresti a 10x traffico?
**Short-term:**
- Redis cache (availability TTL 5-10 sec)
- Read replicas PostgreSQL
- Connection pooling (pgBouncer)

### 6. Debolezze del progetto?
1. No coverage reporting (TODO: 80% threshold)
2. No E2E tests (TODO: Playwright)
3. No rate limiting (TODO: 10 req/min per IP)
4. No structured logging (TODO: Pino/Winston)
5. No load testing (TODO: k6 con 100 concurrent users)

### 7. Perché Prisma?
- Type-safety con generated client
- Migrations declarative
- DX eccellente (autocomplete)
**Trade-off:** Vendor lock-in vs velocity

### 8. Come gestisci gli errori?
- Backend: ZodExceptionFilter custom + structured responses
- Frontend: Global error.vue + toast notifications
**File:** `packages/backend/src/shared/filters/zod-exception.filter.ts`

### 9. Strategia di deployment?
- Blue-green per zero-downtime
- Docker multi-stage builds
- Managed services (RDS, ECS/Fargate)
- Feature flags per gradual rollout

### 10. Prossimi step per produzione?
**1-2 settimane:**
- [ ] Coverage 80%+ con threshold CI
- [ ] E2E Playwright (3 critical flows)
- [ ] Rate limiting
- [ ] Structured logging + APM
- [ ] Load testing (k6)
- [ ] Security hardening (CAPTCHA, email verification)

---

## 📂 File Critici da Conoscere

| File | Cosa Dimostra | Riga Chiave |
|------|---------------|-------------|
| `booking.service.ts` | Concurrency handling | 23-29 (FOR UPDATE) |
| `booking-cleanup.service.ts` | Cron jobs | 16 (@Cron) |
| `schema.prisma` | Database design | 48-50 (indexes) |
| `booking.controller.integration.spec.ts` | Testing strategy | Tutto il file |
| `ci.yml` | CI/CD setup | 42-52 (test steps) |
| `docker-compose.yml` | Infrastructure | Services config |

---

## 🎨 Pattern Architetturali Usati

### Backend
✅ **Domain-Driven Design** (pragmatico)
- Modules per dominio: booking (core), travel (supporting), payment (generic)
- Entity-rich model
- Repository pattern via Prisma

✅ **Dependency Injection**
- NestJS DI container
- Loose coupling

✅ **Transaction Script Pattern**
- Service methods wrappano business logic
- Transaction boundaries esplicite

### Frontend
✅ **Smart/Presentational Components**
- Smart: BookingForm, TravelHero (API calls)
- Presentational: TravelInfoPill, BookingDetailsCard (props only)
- Risultato: 84% riduzione codice pagine, 14 componenti riusabili

✅ **Composables Pattern**
- useApi, useCountdown, useFormatters, useMoods
- Logic separation da UI

---

## 🚨 Red Flags da Evitare

❌ "Ho usato X perché è popolare"
✅ "Ho scelto X per [rationale] vs [alternative]. Trade-off: [Y]"

❌ "Non ho fatto X perché non avevo tempo"
✅ "Ho prioritizzato Y su X per impatto maggiore. X sarebbe next step"

❌ Dare risposte vaghe senza riferimenti al codice
✅ "Puoi vedere in booking.service.ts:104 come gestisco..."

---

## 💬 Template di Risposta Strutturata

### Per Scelte Tecniche
```
1. SCELTA: "Ho usato [tecnologia/pattern]"
2. RATIONALE: "perché [motivo] vs [alternative considerate]"
3. TRADE-OFF: "sacrificando [X] per ottenere [Y]"
4. CONTEXT: "questo ha senso per [scenario/scale]"
5. EVOLUZIONE: "per scale maggiori, considererei [Z]"
```

**Esempio:**
> "Ho usato pessimistic locking con FOR UPDATE perché garantisce zero overbooking vs optimistic locking che richiederebbe retry logic complessa. Sacrifico throughput in edge cases per ottenere strong consistency. Questo ha senso per traffico < 1000 req/sec per travel. Per scale maggiori, considererei Redis queue con worker pools."

---

## 🎯 Numeri da Ricordare

| Metrica | Valore | Note |
|---------|--------|------|
| **Timeout carrello** | 15 minuti | Requisito spec |
| **Max seats per travel** | 5 | Requisito spec |
| **Integration tests** | 46 | Con PostgreSQL reale |
| **Frontend tests** | 53 | Unit + component |
| **Test files** | 12 | Backend + frontend |
| **Componenti riutilizzabili** | 14 | Smart + presentational |
| **Cron frequency** | 6 ore | Cleanup expired bookings |
| **CI duration** | 2-3 min | Lint + unit tests + build |
| **CD duration** | 4-5 min | + integration tests |
| **Docker services** | 5 | postgres, backend, frontend, swagger, prisma-studio |

---

## 🔍 Quick Debugging Commands

```bash
# Start full environment
pnpm docker:prod

# View logs
pnpm docker:logs:backend
pnpm docker:logs:frontend

# Run tests
pnpm test                    # All
pnpm --filter backend test   # Backend unit
pnpm --filter backend test:integration:ci  # Backend integration
pnpm --filter frontend test  # Frontend

# Database
pnpm db:studio  # GUI
```

---

## 🎤 Domande da Fare TU

**Tecniche:**
1. "Quali sono le vostre sfide tecniche più grosse ora?"
2. "Come gestite trade-off velocity vs tech debt?"
3. "Processo di code review e architectural decisions?"

**Team:**
4. "Cultura post-mortem blameless dopo incident?"
5. "Come supportate growth engineer junior/mid?"

**Processo:**
6. "Come bilanciate product pressure vs technical excellence?"

---

## 🧠 Mindset da Lead Engineer

**Un Lead Engineer:**
- ✅ Sa il PERCHÉ di ogni scelta, non solo il COSA
- ✅ Pensa a team scalability, non solo codice scalability
- ✅ Bilancia pragmatismo con technical excellence
- ✅ Riconosce limiti e ha piano di improvement
- ✅ Comunica trade-offs, non solo soluzioni
- ✅ Fa domande per capire contesto, non solo rispondere

---

## ⚡ Last-Minute Checklist

**5 minuti prima:**
- [ ] Docker compose running (localhost:3001, localhost:8080 aperti)
- [ ] IDE aperto su booking.service.ts
- [ ] Questo cheat sheet aperto per quick reference
- [ ] Respira profondamente

**Durante:**
- [ ] Riferimenti concreti al codice (file:line)
- [ ] STAR method per risposte (Situation, Task, Action, Result)
- [ ] Chiedi chiarimenti se domanda ambigua
- [ ] "Non lo so, ma il mio approach sarebbe..." (se necessario)

**Dopo ogni risposta:**
- [ ] "Ha senso? Posso approfondire qualche aspetto?"

---

## 🎬 Closing Statement

> "Questo progetto dimostra il mio approccio da Lead Engineer: soluzioni pragmatiche che bilanciano velocity con quality, consapevolezza dei trade-offs, testing adeguato, e mindset di continuous improvement. Sono pronto a portare questo mindset nel vostro team e crescere ulteriormente affrontando sfide più complesse."

---

**Remember:** Non stanno valutando se il codice è perfetto, ma come PENSI da engineer. 🧠

**Confidence, not arrogance. Competence, not omniscience.** 🚀
