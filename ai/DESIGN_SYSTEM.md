# Design System

This file defines the current UI direction and styling constraints.

## Visual Direction

- Style: clean, sharp, minimalist.
- Tone: practical sports utility with modern interface polish.
- Accessibility: keyboard-focus visible, semantic controls preferred.

## Theme Tokens (source in App.css)

- `--bg`: page background
- `--surface`, `--surface-2`: card and panel surfaces
- `--text`, `--muted`: primary and secondary text
- `--accent`, `--accent-2`: action colors
- `--border`: neutral border
- `--danger`: error color
- `--shadow`: shared elevation

## Layout Principles

- Responsive-first shell.
- Sidebar only for logged-in state.
- Content panels with clear hierarchy and low visual noise.
- Keep action buttons limited and obvious.

## Interaction Rules

- Maintain `:focus-visible` outlines for keyboard users.
- Use semantic `<button>`/`<a>` for click targets.
- Avoid hidden side effects (example: do not auto-switch selected import mode unexpectedly).

## Page Intent

- Login: single-purpose entry with clear credentials guidance.
- Players Dashboard: source of truth for roster updates/import.
- Team Builder: focused workflow for selection and balanced generation.
- About: concise product explanation and flow overview.

## Future UI Changes

When editing styles/components, keep:

1. Compact spacing and strong readability.
2. High-contrast action states.
3. Mobile behavior tested at <=768px.
4. Minimalist consistency with existing token palette.
