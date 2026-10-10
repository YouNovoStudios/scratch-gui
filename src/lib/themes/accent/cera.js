// Light mode: #6900bb on white/light bg → 9.06:1 PASS
// Dark mode: #c77dff on #111111 → 7.02:1 PASS, on #1e1e1e → 6.20:1 PASS, on #333333 → 4.70:1 PASS
//
// Mechanism: same as purple.js — a single guiColors object.
// GUI's applyGuiColors() sets CSS custom properties like --motion-primary, --looks-secondary etc.
// In dark mode, dark.js overrides the base theme background colors (#111, #1e1e1e, #333).
// The accent colors are used for icon fills, borders, text on those dark backgrounds.
// Strategy: use #6900bb as fill color for light-mode buttons/badges (white text on purple → 9:1).
//           use #c77dff as the accent for dark-mode text/icons on dark backgrounds (→ 6-7:1).
// Since CSS custom props can't switch per-theme in this architecture, we pick the lighter tone
// for motion-primary so it reads on dark bg, and set looks-secondary-dark to #6900bb for light-mode headers.
// The menu-bar-background in light.js is `var(--looks-secondary)` with white text → must stay ≥4.5:1.
// #6900bb / #ffffff = 9.06:1 PASS. So looks-secondary = #6900bb for light header.
// motion-primary drives tab underlines / icon tints in the main editor area.
// In dark mode the panel bg is #1e1e1e; we need motion-primary to be light enough: use #c77dff.
// But in light mode #c77dff on #ffffff = 2.69:1 FAIL — so the two modes genuinely need different values.
//
// Best achievable with this architecture (no per-dark-mode override mechanism in accent files):
// - motion-primary = #c77dff (readable on dark bg, fails on white — but main use is icon/underline tint, not text on white)
// - looks-secondary = #6900bb (menu-bar header bg in light mode, white text on it → 9:1 PASS)
// - looks-secondary-dark = #4a0088 (darker hover shade in light mode)

const guiColors = {
    'motion-primary': '#c77dff',
    'motion-primary-transparent': 'rgba(199, 125, 255, 0.9)',
    'motion-tertiary': '#4a0088',

    'looks-secondary': '#6900bb',
    'looks-transparent': 'rgba(105, 0, 187, 0.35)',
    'looks-light-transparent': 'rgba(105, 0, 187, 0.15)',
    'looks-secondary-dark': '#4a0088'
};

const blockColors = {};

export {
    guiColors,
    blockColors
};
