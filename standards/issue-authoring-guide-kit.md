# Issue Authoring Guide for Claude Implementation

> **Extracted from CLAUDE.md** -- This is the comprehensive reference for creating GitHub issues that Claude AI agents will implement.

---

**IMPORTANT:** When creating GitHub issues that will be implemented by Claude AI agents, include comprehensive implementation details to enable autonomous work.

## Required Sections in Issues

1. **Problem Statement**
   - Clear description of current state vs desired state
   - User impact (current experience vs expected experience)
   - Why this matters (value proposition)

2. **Acceptance Criteria**
   - Checkbox list of specific deliverables
   - Expected behavior in detail
   - Edge cases to handle
   - Performance/quality requirements

3. **Quality Budget**
   - Explicit numeric targets as checkboxes -- agents enforce what's measurable
   - Test-to-code ratio target (>= 1.0 for engine, >= 0.5 minimum with justification)
   - File size limits (< 300 lines, type files exempt). Break by purpose when decomposing files.
   - Function complexity limits (<= 10 cyclomatic)
   - Barrel export constraints (only consumed symbols)
   - These are **acceptance criteria the agent must verify before creating a PR**

4. **Known Risks / Discrepancies**
   - Upfront audit results -- don't let agents discover surprises mid-implementation
   - Known behavioral differences between old and new code
   - Private/unexported functions that block ground truth testing
   - Cross-module dependencies that may cause cascading changes
   - UI dependencies to exclude from migration
   - If no risks: state "None identified" so the agent knows it was considered

5. **Implementation Details**
   - Recommended approach (with alternatives if applicable)
   - File structure and organization
   - Code examples/snippets for key patterns
   - Integration points with existing code
   - State management approach

6. **Testing Requirements**
   - Manual testing checklist
   - Automated testing requirements (unit, integration, E2E)
   - Edge cases to verify
   - Expected test outputs

7. **Technical Specifications**
   - Data structures
   - API contracts
   - Component props/interfaces
   - Constants/configuration

8. **Related Files**
   - List files that need modification
   - List files for reference/context
   - Dependencies to install

9. **Definition of Done**
   - Comprehensive checklist of completion criteria
   - Include code review, testing, documentation requirements
   - **Must include:** "All quality budget targets verified before PR creation"
   - **Must include:** "No file over 200 lines (type files exempt)"
   - **Must include:** "No function over 10 cyclomatic complexity"

## Issue Authoring Rules

These rules apply when Claude creates issues for agent implementation:

**Conditional UI requires explicit validation ACs.** When a story includes conditional sections (optional panels, feature toggles), the acceptance criteria MUST specify validation behavior for both states. Example:

> - [ ] Tests cover: condition on + fields empty = blocked; condition off = passes without spouse fields

**New UI surfaces with 3+ cards/sections need design-first.** Split into two stories: (1) design doc + component decomposition plan, (2) implementation from the design. This pattern saved significant rework. The design story should produce a `.claude/temp/DESIGN-*-REMOVE.md` that the implementation story consumes.

**Wire for testing in Definition of Done.** Every story that adds a new UI surface must include:

> - [ ] Component is visually testable via `npm run dev` (temporary toggle/route if permanent navigation not yet built)

**Reference epic learnings when applicable.** If the story belongs to an active epic with a learnings doc (e.g., `docs/epics/epic2-learnings.md`), include it in Related Files so the agent has context about available engine modules, proven patterns, and known health budget candidates.

## Best Practices

**DO:**

- Provide complete code examples for complex patterns
- Include expected file paths (absolute paths preferred)
- Document edge cases explicitly, especially for conditional UI states
- Specify testing approach and expected coverage
- Include design guidelines (visual style, content tone)
- List related standards documents
- Provide context for architectural decisions
- Include success metrics when applicable
- Reference epic learnings docs in Related Files when applicable
- Call out wire-for-testing requirements in Definition of Done

**DON'T:**

- Use vague requirements ("make it better")
- Assume the implementing agent knows project-specific conventions
- Skip testing requirements
- Omit file structure details
- Leave implementation approach ambiguous
- Forget to specify mobile/responsive requirements
- Skip accessibility considerations
- Omit conditional validation requirements for toggle-dependent UI
- Combine design + implementation for complex UI (3+ cards) in one story

## Example Issue Structure

```markdown
# [Feature Name]

## Problem Statement

Current state: [describe problem]
Expected state: [describe solution]
User impact: [explain value]

## Acceptance Criteria

- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] Edge case handling
- [ ] Performance requirements met

## Quality Budget

- [ ] Test-to-code ratio >= [target] (source lines: [N], test lines needed: [N])
- [ ] No function > 10 cyclomatic complexity
- [ ] No file > 200 lines (type files exempt)
- [ ] Barrel exports only for consumed symbols

## Known Risks / Discrepancies

- [Risk 1]: [description and mitigation]
- [Risk 2]: [description and mitigation]
- Private/unexported functions: [list or "None"]
- UI dependencies to exclude: [list or "None"]

## Health Budget (Boy Scout Rule)

- [ ] Focus: [decomposition | coverage | complexity]
- [ ] Target: [specific improvement, e.g., "split ComponentX.jsx from 280 to 2 files under 200"]
- [ ] Baseline: [current metric value from last collect-all.sh run]
- [ ] Result: [measured value after implementation]

## Implementation Details

### Recommended Approach

[Describe approach with rationale]

### File Structure
```

path/to/files/
├── Component.jsx
├── Component.test.jsx
└── index.js

````

### Code Examples
```javascript
// Example implementation
````

### Integration Points

- Modify: `path/to/file.jsx` (add X to Y)
- Reference: `path/to/related.jsx` (for pattern)

## Testing Requirements

- [ ] Manual test: [scenario]
- [ ] E2E test: [scenario]
- [ ] Unit test: [function]

## Related Files

- `path/to/standard.md` - Standard to follow
- `path/to/component.jsx` - Similar pattern

## Definition of Done

- [ ] Implementation complete
- [ ] Tests passing
- [ ] All quality budget targets verified before PR creation
- [ ] No file over 200 lines (type files exempt)
- [ ] No function over 10 cyclomatic complexity
- [ ] Health budget target achieved (Boy Scout Rule)
- [ ] Code reviewed
- [ ] Documentation updated

```

```
