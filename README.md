# ST Scholarship Saathi (जागो / JAGO)

Unified scholarship access for Scheduled Tribe (ST) students under the Ministry of Tribal Affairs (MoTA), Government of India.

> All your ST scholarships. One place.

This pulls five MoTA schemes, three old portals, and seven verification registries into a single mobile app. Student, officer, and ministry admin all see the same data.

---

## The problem we picked

We read the problem statement and kept coming back to one thing. A student in Koraput or Sundargarh does not lose a scholarship because of talent. They lose it because of paperwork.

Concretely, from talking to people in tribal districts and reading the actual portal flows:

- **Five schemes, three portals.** NSP, SFMP and the NOS portal. Most students do not know which one they qualify for, and a lot of them apply to the wrong one.
- **Same certificate every year.** Caste certificate, income certificate — uploaded again at every renewal, even though it already sits in a state database.
- **One mismatch ends everything.** Profile says family income ₹1,80,000, the e-District record says ₹2,10,000. Application gets stuck. Nobody tells the student. Three months pass.
- **Portal is down, student is guilty.** A 503 from a state server turns into a permanent failure for someone who did nothing wrong.
- **No idea where the file is.** Submitted, then silence. Which office holds it, who has it, when money lands — nobody can say.
- **English only.** In districts where Santali and Gondi are the home language.
- **Eligible students nobody knows about.** This was the big one for us. MoTA knows roughly how many ST students exist and roughly how many are on scholarships. Those two numbers do not match, and there is no tool that shows the gap.

That last point is what made us build this. The gap is real, it is measurable, and nobody has a tool to show it.

---

## What we built

One app. Three roles. Same data underneath.

**Student / parent**
- Eligibility check across all five schemes at once, with a reason for every pass and fail
- Document wallet — caste, income, APAAR, bank mandate, each with issuer and expiry
- Application forms prefilled from the verified profile, drafts saved automatically
- Stage-by-stage tracking: Submitted → Institute Verification → State Verification → Sanctioned → DBT Initiated → Disbursed
- Pending action center for mismatches, uploads, bank revalidation
- Every installment with UTR number and PFMS transaction ID
- Printable receipt after submitting
- Parents can switch between linked children

**Verification officer (DWO / nodal)**
- Exception queue sorted by SLA urgency
- Side-by-side view: what the student entered vs what the registry says, per field
- Approve, request correction, or reject with reason — one tap, written to audit trail

**Ministry admin**
- Coverage rate, cohort-to-DBT funnel, exception rate
- District gap view — Odisha, Jharkhand, MP, Chhattisgarh
- Outreach campaign builder for eligible-but-unregistered students

---

## The one idea that mattered

If we had to defend this project in one line:

> A wrong data value should not cancel a student's scholarship.

This is the part almost every team gets wrong. The obvious design is: verification fails → reject. That is exactly what the current portals do, and it is the complaint in the problem statement.

So we built it the other way:

```
data mismatch  ->  MISMATCH  ->  open a case for the officer  ->  application keeps moving
registry down  ->  UNAVAILABLE ->  queue a retry later         ->  application keeps moving
scheme doesn't apply -> NOT_APPLICABLE -> skip
all good       ->  VERIFIED   ->  proceed
```

The student is never punished for a clerical error or somebody else's server being down. The work moves to the officer's queue, where a human with the authority to fix it will actually look at it. And the student gets a clear message about what is happening instead of a silent freeze.

We enforced this in the code rather than writing it in a policy PDF. Every one of the seven registry checks returns a non-blocking flag, and there is no path in the whole codebase where a mismatch or an outage ends a student's application. If we ever added an eighth check, it would have to return that flag too, or it would not compile against the same interface.

The other half of the idea is showing both sides. The student sees the non-blocking status. The officer sees the same case, side by side, with a deadline. Teams usually build one and forget the other, and then it does not feel finished.

---

## About JAGO

JAGO is the assistant in the app. It answers questions about your own record — application status, payments, what is pending, which schemes you fit, what documents you need.

Two things we were strict about:

**It only reads your own data.** If you ask about another student, it refuses and says why. This is checked before any lookup happens, not after, and the attempt is logged. We did this because a scholarship app that leaks one student's payment status to another is a privacy failure, and a student has no way to detect it. The refusal message cites the DPDP Act 2023 rather than just saying "denied", because the user deserves to know there is a law behind the wall.

**It only answers from your records.** It is rule-based, not a language model. Every answer is assembled from your actual application, payment and document data. It cannot invent a status or guess an amount, because there is no free-form generation step to guess from. This also means it works with no internet connection, which matters more than being clever.

It works in seven languages — English, हिन्दी, বাংलা, ଓଡ଼ିଆ, मराठी, संताली, Gondi. We added Santali and Gondi on purpose. Hindi and Odia prove we can translate. Santali and Gondi prove we understand who is actually using this.

---

## Tech stack

| | |
|---|---|
| React 19 + TypeScript | Rule-heavy domain, wanted types |
| Vite 8 | Build speed, mattered at 3am |
| Tailwind CSS 4 | Design tokens, dark mode, fast to iterate |
| i18next + react-i18next | 7 languages, localStorage persistence |
| Lucide React | Icons |
| Custom router | ~100 lines, no framework lock-in |
| Express + dotenv | Optional server side |

Types live in one file (`src/types/index.ts`) across five stages — core records, eligibility, verification, officer console, ministry analytics. `npm run lint` runs `tsc --noEmit` and it has to pass.

One note for anyone reading the repo: business rules are not inside components. Income ceilings, academic levels, eligibility criteria and form fields all sit in plain data files under `src/data/`. A policy person can change a rule without touching a component. For a government project that felt like the right call, since the rules change more often than the code does.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

or with bun:

```bash
bun install
bun run dev
```

| Command | |
|---|---|
| `npm run dev` | Dev server on :3000, bound to `0.0.0.0` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the build |
| `npm run lint` | `tsc --noEmit` |

No API keys. No backend. No database. Clone and it runs.

Because `0.0.0.0` is already set, you can open `http://<your-lan-ip>:3000` on a phone. We demoed on a real handset every time — judges on a laptop and students on a budget Android phone are not the same experience, and the second one is the actual user.

---

## Demo path

Five personas are seeded in. Login screen, pick one, or use the role cards on the landing page.

**Ramesh** — Class 9, Odisha, clean post-matric application. Good for the happy path: eligibility, payments, receipt, wallet.

**Priya** — Class 10, Jharkhand, income mismatch. Declared ₹1,80,000, registry says ₹2,10,000. This is the one to demo. It shows the whole idea in about 30 seconds.

**Parent** — two children in different schemes, family view.

**Officer** — SLA-tiered queue, side-by-side discrepancy, one-tap decisions.

**Admin** — coverage rate, funnel, district gaps, outreach builder.

The path we used, timed at about 90 seconds:

```
Landing → Check my eligibility
       → open Priya, run verification, mismatch shows up
       → application is still moving, nothing rejected
       → a case is now in the officer queue
       → switch role, open the same case, approve it
       → switch to admin, show the coverage gap
```

Same student, same case, three roles. That continuity is the thing that landed with the judges — not any individual screen.

---

## The five schemes

| Scheme | Level | Income ceiling | Max benefit | Portal |
|---|---|---|---|---|
| Pre-Matric ST | Class 9–10 | ₹2,50,000 | ₹1,250 / ₹1,500 per month | NSP |
| Post-Matric ST | Class 11 → Graduation | ₹2,50,000 | Maintenance + tuition + books | NSP |
| Top Class Education | Class 9–12, premier schools | ₹6,00,000 | Full tuition + living + books | NSP |
| National Fellowship for ST | Ph.D. (NET-JRF / CSIR-NET) | No income bar, merit based | ₹50,000–₹80,000 per year + contingency | NSP |
| Top Class Education — Overseas | Post-grad, foreign university | ₹6,00,000 | Tuition, living, travel, insurance | NOS |

One-scholarship-at-a-time is a statutory rule, so it is in the eligibility engine. If you already hold one, the engine returns `blocked_by_active_scholarship` instead of quietly letting you apply for a second.

---

## Verification

Seven registries, all run in parallel so the student waits for the slowest one, not the sum:

| Check | Registry |
|---|---|
| `UIDAI` | Aadhaar e-KYC — demographic and biometric token |
| `EDISTRICT` | State e-District — caste certificate, tribe, income |
| `AISHE` | Higher-ed institution accreditation |
| `UDISE_PLUS` | School recognition, EMRS / KGBV |
| `APAAR` | One-Nation-One-Student ID, enrollment |
| `UGC_NTA` | NET-JRF qualification, fellowship quota |
| `UDID` | Disability quota |

Outcomes: `VERIFIED`, `MISMATCH`, `UNAVAILABLE`, `NOT_APPLICABLE`. The last one matters — UDISE+ correctly returns not-applicable for a Ph.D. applicant instead of failing them for having no school record.

**Name matching.** Government records spell names differently. `Ram Kumar`, `Ram Chander`, `Ram Charan` are the same person. We blend Levenshtein distance with token overlap and strip the common middle names and honorifics (`kumar`, `kumari`, `chandra`, `lal`, `prasad`, `shri`, `smt`). 80+ is a match, 60–79 goes to an officer, below 60 gets logged as a clerical issue. Without this, half of correct applications would be flagged.

**Audit trail.** Every check writes an entry with transaction ID, outcome, actor and a hash of the response. Officer decisions get hashed too, so the record is tamper-evident.

---

## How we built this

If you are here to reuse the approach, this is the part that transfers.

**Start from the problem statement, not the theme.** Government statements bury the actual scoring in specific words. "multilingual", "real-time database integration", "scalable and secure" — each one maps to a criterion. We made a checklist and made sure the demo could tick every box. Also read the domain: who is legally eligible, what is the statutory SLA, and what is allowed to never happen to a citizen's application. The non-blocking rule and the one-scholarship rule came from that reading, not from imagination.

**Find the wedge.** Not "a unified scholarship platform", that is six months. The wedge was: *I don't know what I qualify for, and someone told me it is stuck.* Everything else follows from moving a user through that moment.

**Build the demo spine first.** A SIH demo is 3–5 minutes. We wrote the script before the code, then only built what the script touched. A fully working narrow demo beats a broad half-working one.

**Seed data properly.** Real government data is not available in a hackathon. Instead of empty placeholders we used the real income ceilings, real scheme names, real registry names, real districts — with a deterministic PRNG so the dashboard shows the same numbers every run. When a judge asked where 71.5% came from, we had a consistent answer. Placeholder data reads as fake immediately.

**Demo the failure path.** The happy path is table stakes. The mismatch, the outage, the officer resolving it — that is what made people lean in. Every team shows a student applying successfully. We showed what happens when it does not, and that it still works.

**Prepare for the technical questions.** Real ones we got asked: where is the backend, what if UIDAI is down, how do you handle real Aadhaar data, how does this scale. Have the answers ready, and say plainly when something is simulated. Saying "we mocked the UIDAI adapter because sandbox credentials are not public" earned more trust than pretending.

**Rehearse.** Ten times. First five to learn it, last five to make it boring. One person drives, one person talks. Test on a cheap Android phone before you test on anything else.

**The deck is part of the product.** Real human in slide two, name and district. What the current system costs, quantified. A 30-second screen recording so judges do not have to read your live demo to understand what exists. And be honest about limits — judges have seen enough overclaims.

What won it was not the amount of code. It was reading the problem closely enough to find the one thing the other teams missed, and then demoing it end to end without breaking.

---

## Impact

Tracked on the admin dashboard from the seeded cohort:

| Metric | |
|---|---|
| Coverage rate | Registered ÷ total eligible ST cohort |
| Funnel | Cohort → registered → submitted → sanctioned → disbursed, with drop-off per stage |
| Exception rate | Applications with an open case ÷ total applications |
| Resolution time | Mean days to close vs. the 15-day SLA |
| Outreach gap | Eligible but unregistered, split by state and district |
| Conversion | Outreach contacts → actual registrations |

The coverage gap is the number that matters. If 28% of eligible students have never registered, that is a number someone can act on and budget for.

---

## Privacy

Built against the DPDP Act 2023 and MoTA guidelines.

| | |
|---|---|
| Purpose limitation | Every consent item declares its purpose and issuing agency |
| Minimization | Only masked values are ever rendered. Full Aadhaar or account numbers do not exist in the data model |
| Granular consent | Per-agency, per-purpose toggles, mandatory ones locked and explained |
| Refusal | JAGO blocks and logs cross-applicant queries, citing DPDP §6 |
| Audit | Hash-stamped verification log, officer decisions recorded with ID and reason |
| No silent rejection | Every administrative outcome is explained in plain language |

To be clear about what this is: seeded demo data, no real PII, no calls to any government system. Real deployment would need DigiLocker OAuth with signed consent artifacts, UIDAI tokenized e-KYC, encryption at rest, server-side RBAC, rate limiting and a DPIA. The current role model is client-side because it is a demo.

---

## Roadmap

**Pilot** — real DigiLocker OAuth, Node/Postgres backend, NSP and e-District sandbox integration, voice output for Hindi and Odia.

**Scale** — speech input for low-literacy users, field-mitra app for document capture in low-connectivity blocks, offline-first PWA with queued sync, WhatsApp Business API for templated alerts.

**National** — full UDISE+ and AISHE coverage, PFMS reconciliation with real UTR checks, state nodal officer API.

---

## Contributing

```bash
npm install
npm run dev
npm run lint   # tsc --noEmit, must pass
npm run build  # must succeed
```

| To change | Edit |
|---|---|
| An eligibility rule | `src/data/eligibilityRulesConfig.ts` |
| Form fields or steps | `src/data/applicationFormSchemas.ts` |
| Scheme details | `src/data/seedData.ts` |
| A language | `src/i18n/translations.ts` |
| JAGO behaviour | `src/services/jagoAiEngine.ts` |
| A verification registry | `src/services/verificationEngine.ts` |
| A type | `src/types/index.ts` |

Keep rules declarative. Do not hardcode an income ceiling inside a component. Keep PII masked. Any new verification path has to return the non-blocking flag.

---

## License

MIT. See [LICENSE](LICENSE).
