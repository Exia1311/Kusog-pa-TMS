---
name: ui-ux
description: Use this skill when improving user interfaces, form behavior, validation, accessibility, flow polish, and overall usability in the app.
---

# UI/UX

## When to use

Use this skill when you need to:
- fix form validation or submit errors
- improve empty, loading, or error states
- adjust spacing, hierarchy, or responsiveness
- make buttons, inputs, and flows easier to understand
- align UI behavior with the data model and server validation
- improve accessibility and clarity without broad scope creep

## Goal

Deliver a small, high-confidence UI fix that matches the project’s existing patterns and makes user interactions clearer, safer, and easier to complete.

## Workflow

1. Clarify the user-facing problem
   - Identify the exact screen, field, or interaction.
   - Confirm whether the problem is visual, validation-related, workflow-related, or accessibility-related.

2. Inspect the relevant component and data flow
   - Read the component that renders the UI.
   - Check the server or schema validation that drives the behavior.
   - Trace the real submission path before changing anything.

3. Fix the root cause, not the symptom
   - Prefer the smallest correct fix.
   - Keep validation rules consistent between the UI and backend.
   - Avoid adding workaround logic that hides the underlying issue.

4. Preserve project conventions
   - Match the project’s established styling and form patterns.
   - Keep interaction names and naming consistent with the app.
   - Avoid introducing unnecessary dependencies or large rewrites.

5. Validate the change
   - Check the touched files for TypeScript or editor errors.
   - Confirm the user path works end-to-end for the affected scenario.
   - Ensure required and optional fields are visibly correct.

6. Review UX quality
   - Error messages should be clear and actionable.
   - Required fields must be obvious.
   - Empty states, disabled states, and success states should be understandable.
   - The fix should remain usable on the target screen sizes.

## Decision points

- If the bug is caused by validation mismatch, fix both the UI and the underlying schema/server rule.
- If the issue is caused by a missing dependency or import, fix the dependency path before adjusting styling.
- If the issue is mostly visual, keep it scoped to the component and avoid unrelated refactors.
- If the issue affects user trust, prefer explicit feedback over silent fallback behavior.

## Quality bar

A good UI/UX fix should:
- solve the real user problem
- work without silent failures
- show clear required vs optional fields
- keep messages consistent and human-readable
- leave the app in a clean, compilable state
- avoid unrelated UI churn

## Example prompts

- "Fix the form validation so optional fields are truly optional."
- "Improve the empty and error states for this form."
- "Make the ticket save flow clearer and prevent confusing validation errors."
- "Review the UI for inconsistent required-field messaging and align it with the backend."
- "Polish this screen to make the primary action more obvious and the flow easier to complete."

## Related customizations

- Create a companion skill for form-validation workflows.
- Create a skill for accessibility review and keyboard usability.
- Create a skill for responsive layout tuning and component polish.
