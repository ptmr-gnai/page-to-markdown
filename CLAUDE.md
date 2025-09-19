# CLAUDE Configuration v1 - Compounding Engineering

## Mission
Every interaction is an opportunity to make the next one better. Watch for inefficiencies, anti-patterns, and manual processes that slow development. Proactively suggest improvements that compound over time.

## Compounding Engineering Principles

### 1. Anti-Pattern Detection
Continuously watch for and flag:
- **Manual Copy/Paste**: Suggest abstraction into functions, constants, or templates
- **Repetitive Tasks**: Identify automation opportunities (scripts, aliases, shortcuts)
- **Configuration Drift**: Notice inconsistencies in naming, structure, or conventions
- **Technical Debt**: Highlight quick wins for code cleanup and optimization
- **Process Friction**: Identify workflow bottlenecks and suggest streamlined approaches

### 2. Continuous Improvement
After each task completion:
- **Document Learnings**: What patterns emerged? What could be automated?
- **Update This File**: Suggest additions to improve future interactions
- **Create Shortcuts**: Propose aliases, scripts, or templates for repeated workflows
- **Refine Conventions**: Notice and suggest consistency improvements

### 3. Investment Mindset
Prioritize solutions that:
- Save time in future sessions
- Reduce cognitive load
- Prevent common mistakes
- Scale across team members
- Compound in value over time

## Tech Stack
- Framework: Chrome Extension (Manifest V3)
- Language: TypeScript/JavaScript
- Build Tool: Vite + Node.js
- Package Manager: npm
- Extension Type: Content Script + Background Service Worker + Popup UI

## Project Structure
```
src/                    # Source code
├── manifest.json       # Chrome extension configuration
├── popup.html          # Extension popup interface
├── popup.css          # Popup styling
├── popup.ts           # Popup logic (TypeScript)
├── content.ts         # Content script for page interaction
├── background.ts      # Background service worker
├── types/             # TypeScript definitions
├── utils/             # Helper functions
│   ├── content-extractor.ts    # DOM content extraction
│   └── markdown-converter.ts   # HTML to Markdown conversion
└── icons/             # Extension icons (16, 48, 128px)
dist/                  # Built extension (load unpacked here)
docs/                  # Documentation
├── README.md          # Installation and usage guide
├── REQUIREMENTS.md    # Project requirements
├── OBSIDIAN_ANALYSIS.md # Analysis of reusable components
└── DEBUG_STEPS.md     # Debugging procedures
```

## Essential Commands
```bash
# Development
npm install            # Install dependencies
npm run build          # Build extension to dist/ folder
npm run type-check     # TypeScript type validation
npm run lint           # ESLint code linting

# Extension Development
# 1. Build: npm run build
# 2. Load: chrome://extensions/ → Load unpacked → select dist/ folder
# 3. Reload: Click refresh button on extension card after changes
# 4. Debug: F12 on page + Right-click popup → Inspect + Background page console

# Key Locations for Debugging
# - Page Console: F12 on any webpage (content script logs)
# - Popup Console: Right-click extension popup → Inspect
# - Background Console: chrome://extensions/ → Click "service worker"
```

## Code Style & Conventions
- Use ES modules (import/export) - Chrome extensions support native ES modules
- File naming: `kebab-case` for files, extensions follow Chrome naming conventions
- Function naming: `camelCase` with descriptive verbs
- Constants: `UPPER_SNAKE_CASE`
- Chrome Extension specific:
  - Use `chrome.*` APIs directly (no need for webextension-polyfill in this simple case)
  - Service workers require different patterns than traditional web pages
  - Content scripts have access to page DOM but limited extension APIs
  - Always handle chrome.runtime.lastError in callbacks
  - Use data URLs instead of blob URLs in service workers

## Efficiency Patterns to Promote
1. **Template Creation**: When creating similar files, generate templates
2. **Configuration as Code**: Store common setups in version-controlled configs
3. **Snippet Libraries**: Build reusable code snippets for common patterns
4. **Documentation Integration**: Keep docs close to code, update simultaneously
5. **Testing Automation**: Write tests that prevent future regressions

## Anti-Patterns to Flag & Fix
1. **Magic Numbers**: Replace with named constants
2. **Duplicate Code**: Extract into shared utilities
3. **Manual File Creation**: Create generators for common file types
4. **Inconsistent Naming**: Establish and enforce naming conventions
5. **Missing Documentation**: Add inline docs for complex logic
6. **Hard-coded Values**: Move to configuration files
7. **Copy-Paste Debugging**: Create proper debugging workflows
8. **Chrome Extension Specific**:
   - **DOM APIs in Service Workers**: Use data URLs, not blob URLs or document methods
   - **Blocking sendMessage calls**: Always handle chrome.runtime.lastError
   - **Content script injection assumptions**: Always ping content scripts before use
   - **Missing permissions**: Add required permissions to manifest.json upfront

## Repository Workflow
- Branch naming: `feature/description` or `fix/description`
- Commit format: `type: description` (e.g., `feat: add user authentication`)
- PR requirements: Tests pass, linting clean, description includes context
- Code review: Focus on maintainability and future developer experience

## Automation Opportunities Checklist
Track and implement these efficiency multipliers:

### Development Setup
- [ ] One-command environment setup
- [ ] Automated dependency installation
- [ ] Development database seeding
- [ ] Environment variable templates

### Code Generation
- [ ] Component scaffolding scripts
- [ ] API endpoint generators
- [ ] Test file templates
- [ ] Documentation generators

### Quality Assurance
- [ ] Pre-commit hooks for linting/formatting
- [ ] Automated test running on file changes
- [ ] Continuous integration pipeline
- [ ] Dependency security scanning

### Deployment
- [ ] One-command deployment scripts
- [ ] Environment-specific configurations
- [ ] Rollback procedures
- [ ] Health check automation

## Continuous Learning Protocol
At the end of each session, consider:

1. **What was repeated?** → Can we automate it?
2. **What was confusing?** → Can we document it?
3. **What was slow?** → Can we optimize it?
4. **What was error-prone?** → Can we prevent it?
5. **What patterns emerged?** → Can we template them?

## Session Improvement Tracking
```markdown
<!-- Update after each significant session -->
## Recent Improvements
- 2025-09-19: Built complete Chrome extension for web page → Markdown conversion
  - Implemented smart content extraction using DOM parsing
  - Added comprehensive frontmatter generation (URL, title, timestamp, author, etc.)
  - Created robust debugging system with emoji logging for 3-tier architecture
  - Solved Manifest V3 service worker limitations (URL.createObjectURL → data URLs)
  - Achieved working end-to-end flow: Page → Content Script → Popup → Background → Downloads

## Next Optimization Targets
- [ ] Add better content extraction for complex layouts (tables, code blocks)
- [ ] Implement batch processing for multiple tabs
- [ ] Add custom save location picker (beyond Downloads folder)
- [ ] Create template system for different content types
- [ ] Add integration with note-taking apps via custom protocols

## Development Antipatterns Learned (2025-09-19)
**Issue:** Jumped into complex architecture before validating basic Chrome extension patterns

### What Slowed Us Down:
1. **Build Tool Over-Engineering**: Started with Vite + plugins instead of simple file copying
2. **Dependency Bloat**: Added libraries before trying vanilla Chrome APIs
3. **Architecture Before Validation**: Designed TypeScript structure before testing Manifest V3 constraints
4. **Late Debugging Infrastructure**: Added logging after hitting mysterious errors

### Prevention Strategy: "Minimum Viable Extension" Pattern
```
Phase 1 (15 min): Working 3-tier communication (popup ↔ background ↔ content)
Phase 2 (30 min): Core feature with zero dependencies
Phase 3 (60+ min): Enhancement with libraries/build tools only if justified
```

### Chrome Extension Starter Checklist:
- [ ] Test manifest.json loads without errors
- [ ] Verify popup → background communication works
- [ ] Verify background → content script communication works
- [ ] Add comprehensive logging to all three layers
- [ ] THEN add business logic
```

## Do Not
- Manually repeat tasks that could be scripted
- Copy-paste code without considering abstraction
- Accept inefficient workflows as "just how we do things"
- Skip documentation for complex or non-obvious solutions
- Ignore opportunities to reduce future cognitive load

## Remember
Every inefficiency spotted is an investment opportunity. Every manual process is automation waiting to happen. Every repeated pattern is a template in disguise. Make each session count for all future sessions.

---

*This file should evolve with each session. Update it when you discover new patterns, inefficiencies, or optimization opportunities.*