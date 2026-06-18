# Orquestador VibeCoding — Task List

## Phase 1: Foundation
- [ ] `package.json` — dependencias y scripts
- [ ] `server.js` — API REST Express
- [ ] `.gitignore`
- [ ] `.env.example`

## Phase 2: Data Catalogs
- [ ] `src/data/agents-catalog.json` — 11 agentes OmO + metadata
- [ ] `src/data/models-catalog.json` — modelos con precios/benchmarks
- [ ] `src/data/providers-catalog.json` — proveedores con endpoints

## Phase 3: Core Engine
- [ ] `src/core/config-engine.js` — motor de configuración
- [ ] `src/core/fallback-router.js` — sistema de fallback multi-proveedor/cuenta
- [ ] `src/core/account-manager.js` — gestión multi-cuenta
- [ ] `src/core/provider-registry.js` — registro de fuentes
- [ ] `src/core/cost-calculator.js` — calculadora de costos
- [ ] `src/core/project-manager.js` — CRUD de proyectos
- [ ] `src/providers/base-provider.js` — clase base de proveedor

## Phase 4: Generators
- [ ] `src/generators/omo-config.js` — genera oh-my-openagent.json
- [ ] `src/generators/opencode-config.js` — genera opencode.json
- [ ] `src/generators/env-generator.js` — genera .env
- [ ] `src/generators/setup-script.js` — genera setup scripts Ubuntu/Debian
- [ ] `src/generators/readme-generator.js` — genera AGENTS-README.md

## Phase 5: Frontend
- [ ] `public/index.css` — design system completo
- [ ] `public/index.html` — SPA principal
- [ ] `public/app.js` — router + state
- [ ] `public/components/wizard/wizard-container.js`
- [ ] `public/components/wizard/step-project.js`
- [ ] `public/components/wizard/step-sources.js`
- [ ] `public/components/wizard/step-apikeys.js`
- [ ] `public/components/wizard/step-agents.js`
- [ ] `public/components/wizard/step-fallbacks.js`
- [ ] `public/components/wizard/step-review.js`
- [ ] `public/components/shared/model-card.js`
- [ ] `public/components/shared/agent-card.js`
- [ ] `public/components/shared/provider-badge.js`
- [ ] `public/components/shared/fallback-chain.js`
- [ ] `public/components/shared/cost-bar.js`
- [ ] `public/components/shared/config-preview.js`
- [ ] `public/components/shared/account-switcher.js`
- [ ] `public/components/dashboard.js`
- [ ] `public/components/cost-monitor.js`
- [ ] `public/components/account-manager-ui.js`
- [ ] `public/components/export-panel.js`

## Phase 6: Templates & Scripts
- [ ] `templates/mi-setup-actual.json`
- [ ] `templates/budget-single.json`
- [ ] `templates/opencode-go-only.json`
- [ ] `scripts/setup-ubuntu.sh`
- [ ] `scripts/setup-debian.sh`
- [ ] `scripts/deploy-vm.sh`

## Phase 7: Verification
- [ ] npm install + npm run dev
- [ ] Test API endpoints
- [ ] Test wizard flow
- [ ] Test config generation
- [ ] Test export ZIP
