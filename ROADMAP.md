# Orbsona roadmap

Orbsona is building the open-source presence layer for AI agents: a portable visual identity plus a live renderer that communicates runtime state. The near-term goal is adoption and trust, not feature volume.

This roadmap is directional. Evidence from real integrations can reorder it.

## Product principles

- Keep the identity contract portable, local-first, and provider-neutral.
- Keep the renderer and core Studio free under MIT.
- Preserve existing identities across releases.
- Make 20–64 pixel production use as intentional as the large Studio preview.
- Add hosted coordination only when users demonstrate that local files are the limiting factor.
- Describe deterministic fingerprints as reproducibility, never as global uniqueness, ownership, or authentication.

## Now: launch and learn (days 0–30)

### Ship and protect v0.1

- Release v0.1.1 with compact avatar rendering, fixed 512 × 512 PNG export, exposed seeds, and the frozen v1 seed contract.
- Gate pull requests with lint, package tests, the production build, and critical browser journeys.
- Run Firefox and WebKit journeys on a scheduled workflow if the main CI gate becomes too slow.
- Add trusted npm publishing with provenance after the repository and npm organization are connected.
- Keep a changelog and immutable release tags.

### Make first adoption easy

- Publish one complete voice-agent example and one non-voice agent example using the provider-neutral state contract.
- Add framework-support guidance: React is the maintained renderer; the JSON identity contract is framework-neutral.
- Add contribution guidance, focused issue templates, and a small static showcase of real integrations.
- Improve the seed editor’s invalid/empty state and add a time-based escape path for PNG export from a hidden tab.

### Measure without product telemetry

- Track npm weekly downloads, GitHub dependents, external issues and pull requests, and opt-in production examples.
- Ask adopters what blocked integration and which state mappings they actually used.
- Do not add runtime analytics to the open-source package.

## Next: deepen the platform (days 31–60)

### Identity contract v2

- Design an order-independent, versioned derivation algorithm so new palettes, reliefs, and motion systems can be added without remapping existing seeds.
- Add explicit v1-to-v2 migration tooling and compatibility fixtures.
- Introduce a stable visual fingerprint for reproduction and debugging. It is not a uniqueness or ownership claim.

### Better production integration

- Add a framework-neutral renderer path, starting with a vanilla canvas API or Web Component.
- Publish event-mapping recipes for common voice and agent runtimes without claiming provider partnerships.
- Add state-machine helpers that smooth noisy audio levels and transient connection states.
- Bring WebM export to fixed output dimensions and document its browser support boundary.

### Quality at scale

- Benchmark pages with many simultaneous avatars and publish a render budget.
- Add canonical cross-browser visual checks where browser rasterization is stable enough.
- Add accessibility and reduced-motion examples to the public documentation.

## Later: coordinated identity (days 61–90)

Only begin this phase when the promotion criteria below are met.

- Prototype optional share links for an identity document and renderer preview.
- Explore a team identity library with revisions, brand constraints, approval history, and deployment-ready URLs.
- Explore hosted image/video rendering for systems that cannot run a browser canvas.
- Test a private organization registry for coordination, not a global uniqueness system.

If validated, the hosted product can charge for team workflow, governance, history, and managed delivery. The renderer, schema, local Studio, and file export remain free.

## Not now

- Global uniqueness, collision-proof “agent DNA,” name reservation, or proof of ownership
- Authentication, verification, identity-provider language, or an agent trust network
- A public registry or account system without demonstrated coordination demand
- A paid tier that removes anything already available in the MIT package
- First-party provider partnership claims
- React Native, CommonJS, or a large adapter matrix before the web contract is stable
- Package telemetry

## Success measures

### North star

Weekly active production integrations: applications that actively render Orbsona for real agents. Because the package is local-first and has no telemetry, this is measured through opt-in production submissions and public dependency evidence.

### Supporting signals

- trailing seven-day npm downloads and four-week download retention;
- confirmed external production deployments;
- GitHub dependents and external contributors;
- documentation-to-install conversion where privacy-preserving site analytics are available;
- integration issues resolved and time to first working avatar;
- repeated requests for team sharing, persistence, governance, or hosted rendering.

### Gate for a hosted or paid layer

All of the following should be true before building a public hosted product:

1. At least 1,000 weekly npm downloads for four consecutive weeks.
2. At least 50 confirmed production agents across 10 external projects, including three nameable deployments.
3. Repeated unsolicited requests from multiple adopters for sharing, registry, persistence, or team governance.
4. The identity contract has remained stable for at least 60 days.
5. The proposed service solves a job the local-first package cannot solve and does not gate the free renderer.

Until the gate is met, the highest-value work is renderer quality, integration clarity, and real-world adoption.
