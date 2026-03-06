# Contributing to pIvotX

Thank you for your interest in contributing!

## Getting Started
1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/pIvotX`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Making Changes
- Run a type check: `npx tsc --noEmit`
- Build the project: `npm run build`
- Keep PRs small and focused — one feature or fix per PR

## Submitting a Pull Request
1. Push your branch to your fork
2. Open a PR targeting the `master` branch of this repo
3. Fill out the PR description clearly explaining what changed and why
4. All CI checks must pass before merging
5. At least **1 maintainer approval** is required

## Code Style
- Follow existing TypeScript conventions in `/src`
- Do not introduce new dependencies without discussion in an issue first

## Security
- **Never** commit API keys, tokens, passwords, or any credentials
- Read [SECURITY.md](SECURITY.md) for how to report vulnerabilities responsibly
