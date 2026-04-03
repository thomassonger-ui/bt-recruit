# bt-recruit — Repo File Tree

> **Repo:** `thomassonger-ui/bt-recruit`
> **Branch:** `main`
> **Generated:** 2026-04-03
> **Total files:** 142

---

```
bt-recruit/
│
├── 📁 .claude/
│   └── launch.json
│
├── 📁 app/
│   ├── 📁 academy/
│   │   └── page.tsx
│   ├── 📁 api/
│   │   ├── 📁 an-token/
│   │   │   └── route.ts
│   │   ├── 📁 auth/
│   │   │   └── 📁 linkedin/
│   │   │       ├── route.ts
│   │   │       └── 📁 callback/
│   │   │           └── route.ts
│   │   ├── 📁 availability/
│   │   │   └── route.ts
│   │   ├── 📁 booking-webhook/
│   │   │   └── route.ts
│   │   ├── 📁 chat/
│   │   │   └── route.ts
│   │   ├── 📁 coach/
│   │   │   └── route.ts
│   │   ├── 📁 cron/
│   │   │   ├── 📁 cold/
│   │   │   │   └── route.ts
│   │   │   ├── 📁 digest/
│   │   │   │   └── route.ts
│   │   │   ├── 📁 drip/
│   │   │   │   └── route.ts
│   │   │   ├── 📁 followup/
│   │   │   │   └── route.ts
│   │   │   ├── 📁 noshow/
│   │   │   │   └── route.ts
│   │   │   └── 📁 signal/
│   │   │       └── route.ts
│   │   ├── 📁 dashboard/
│   │   │   └── route.ts
│   │   ├── 📁 delete-lead/
│   │   │   └── route.ts
│   │   ├── 📁 drip-pause/
│   │   │   └── route.ts
│   │   ├── 📁 notify/
│   │   │   └── route.ts
│   │   ├── 📁 onboard/
│   │   │   └── route.ts
│   │   ├── 📁 scout/
│   │   │   └── route.ts
│   │   ├── 📁 sms/
│   │   │   └── route.ts
│   │   └── 📁 unsubscribe/
│   │       └── route.ts
│   ├── 📁 chat/
│   │   └── page.tsx
│   ├── 📁 dashboard/
│   │   └── page.tsx
│   ├── 📁 join/
│   │   └── route.ts
│   ├── 📁 scout/
│   │   ├── RecruitingClient.tsx
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── theme.json
│
├── 📁 bearsignal/
│   ├── 📁 BearSignal-LinkedIn/
│   │   ├── Bear Team Recruit 1.png  … (16 images)
│   │   └── Copy of Bear Team Real Estate Recruiting Post.png
│   ├── 📁 runtime/
│   │   ├── buffer.ts
│   │   ├── generator.ts
│   │   ├── linkedin.ts
│   │   ├── queue.ts
│   │   └── scheduler.ts
│   ├── 📁 templates/
│   │   ├── carousel.md
│   │   ├── email.md
│   │   ├── facebook.md
│   │   ├── linkedin.md
│   │   └── twitter.md
│   ├── ARCHITECTURE.md
│   ├── AUTOMATIONS.md
│   ├── CHANNELS.md
│   ├── FEATURES.md
│   ├── PROMPTS.md
│   ├── README.md
│   ├── ROADMAP.md
│   └── SYSTEM_OVERVIEW.md
│
├── 📁 components/
│   ├── 📁 features/
│   │   └── Hero.tsx
│   ├── 📁 layout/
│   │   ├── Navbar.tsx
│   │   └── Section.tsx
│   └── 📁 ui/
│       ├── 📁 tokens/
│       │   ├── spacing.ts
│       │   └── typography.ts
│       ├── Accordion.tsx
│       ├── Badge.tsx
│       ├── BearAnimation.tsx
│       ├── BearTeamLogo.tsx
│       ├── BlueprintFloatingElements.tsx
│       ├── BlueprintGrid.tsx
│       ├── BlueprintHeroGrid.tsx
│       ├── BlueprintLineLayer.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── DepthLayer.tsx
│       ├── FloatingShapes.tsx
│       ├── Footer.tsx
│       ├── HeroPromptInput.tsx
│       ├── IconCard.tsx
│       ├── Input.tsx
│       ├── ParallaxLayer.tsx
│       ├── ScoutCard.tsx
│       ├── ScoutDemo.tsx
│       ├── ScoutPainPopups.tsx
│       ├── ScoutPromptTabs.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── TryScout.tsx
│       └── container-scroll-animation.tsx
│
├── 📁 lib/
│   ├── 📁 db/
│   │   └── verifyWrite.ts
│   ├── 📁 scout/
│   │   ├── 📁 __tests__/
│   │   │   └── compliance.test.ts
│   │   ├── 📁 config/
│   │   │   └── scoutConfig.ts
│   │   ├── 📁 engine/
│   │   │   ├── decisionTree.ts
│   │   │   └── generateResponse.ts
│   │   ├── 📁 guardrails/
│   │   │   ├── complianceRules.ts
│   │   │   ├── conversionRules.ts
│   │   │   ├── escalationRules.ts
│   │   │   ├── responseValidator.ts
│   │   │   └── systemPrompt.ts
│   │   └── index.ts
│   ├── ai.ts
│   ├── flow.ts
│   ├── intent.ts
│   ├── state.ts
│   └── utils.ts
│
├── 📁 public/
│   ├── 📁 images/
│   │   └── bear-team-recruit-01.png … (16 images)
│   ├── blueprint.jpg
│   ├── file.svg
│   ├── globe.svg
│   ├── join.html
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 scripts/
│   └── upload_images_to_supabase.js
│
├── 📁 supabase/
│   └── schema.sql
│
├── .gitignore
├── CLAUDE.md
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
└── postcss.config.mjs
```

---

## Summary by Section

| Directory | Purpose |
|---|---|
| `app/` | Next.js App Router — pages + API routes |
| `app/api/cron/` | Scheduled automation jobs (cold, drip, digest, followup, noshow, signal) |
| `bearsignal/` | BearSignal content engine — LinkedIn automation, templates, runtime |
| `components/ui/` | All reusable UI components (Blueprint design system) |
| `lib/scout/` | Scout AI engine — decision tree, guardrails, compliance rules |
| `supabase/` | Database schema |
| `scripts/` | Utility scripts |
| `public/` | Static assets + recruiting images |
