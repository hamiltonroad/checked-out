# Agent Operations

## Error Protocol

All agents use a **three-strikes** protocol for blocked tasks:

1. **First failure:** Debug and retry
2. **Second failure:** Try alternative approach (consult standards docs if applicable)
3. **Third failure:** ABORT with detailed explanation of all attempts

## Agent Model Assignments

Any agent or command that spawns another agent MUST specify the model in the invocation.

| Agent      | Model          | Reason                             |
| ---------- | -------------- | ---------------------------------- |
| prep-agent | haiku (always) | Fast, lightweight task             |
| plan-agent | opus (always)  | Deep reasoning required            |
| All others | caller default | No override — inherits from parent |
