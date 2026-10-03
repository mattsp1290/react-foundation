<!--
Provenance

- Source repository: https://github.com/birbparty/birbparty (file `DESIGN.md`)
- Source commit: 9d296034acf0e01626cc657152fca9f6fa4b2883 (birbparty `main`, before the web token extraction)
- Copied: 2026-10-03
- Authority: birbparty's `DESIGN.md` remains the authority for birbparty. This
  copy documents the contract that `css/tokens.css` and `css/base.css`
  implement; drift between the copies is not checked automatically.
- Known stale text: section 4 still says the React application defines its CSS
  variables in `web/src/styles.css` and resolves themes in `web/src/theme.ts`.
  birbparty rewrites that paragraph when it adopts this package, after this
  copy shipped.

Everything below this comment is a verbatim copy.
-->

# Birb Party UI Design Contract

## 1. Purpose and authority

This document governs authored user-interface work in `web/` and `ios/`. When two
directions conflict, use this order of authority:

1. Accessibility requirements and platform semantics.
2. Semantic token contracts implemented by the design system.
3. This design document.
4. Screen-local styling, only for an exception explicitly allowed here.

Contributors and coding agents must explain a new token or exception in this
document before adding a raw color, radius, shadow, or decorative pattern.
Feature code consumes semantic theme roles; it does not choose primitive
colors by appearance.

## 2. Visual direction

Birb Party uses a **fantasy-console utility** direction:

- limited, deliberate color;
- crisp boundaries and flat fills;
- compact, readable hierarchy;
- restrained, functional motion;
- direct product language;
- platform-native, scalable typography; and
- layouts shaped by the task rather than by a template.

This is not a literal TIC-80 emulator. Do not force tiny text, a fixed
240×136 layout, pixel-only input, inaccessible density, or jagged rendering on
ordinary text. The console influence lives in the palette, geometry, and
economy of presentation—not in reduced usability.

## 3. Primitive palette

The external authority is the requested
[Lospec TIC-80 palette](https://lospec.com/palette-list/tic-80-fantasy-console-rejected-uYKY).
Lospec marks that submitted entry as rejected, but its values are the standard
SWEETIE-16 values and remain the user's explicit selection. Moderation status
does not authorize substituting another palette.

| Index | Token | Hex |
| ---: | --- | --- |
| 0 | `black` | `#1a1c2c` |
| 1 | `purple` | `#5d275d` |
| 2 | `red` | `#b13e53` |
| 3 | `orange` | `#ef7d57` |
| 4 | `yellow` | `#ffcd75` |
| 5 | `lime` | `#a7f070` |
| 6 | `green` | `#38b764` |
| 7 | `darkCyan` | `#257179` |
| 8 | `darkBlue` | `#29366f` |
| 9 | `blue` | `#3b5dc9` |
| 10 | `lightBlue` | `#41a6f6` |
| 11 | `cyan` | `#73eff7` |
| 12 | `white` | `#f4f4f4` |
| 13 | `lightGray` | `#94b0c2` |
| 14 | `gray` | `#566c86` |
| 15 | `darkGray` | `#333c57` |

These names and this index order are stable. Only the private palette source
may contain the primitive literals. Do not create shades, alpha variants,
dynamic colors, or aliases that imply semantics.

## 4. Semantic color contract

The implementation may reuse one primitive for several roles. Product code
consumes semantic roles rather than selecting palette entries by appearance.
Every authored foreground/background pair must be explicit in light and dark
modes; platform defaults must not silently select colors.

The React application defines CSS variables in `web/src/styles.css` and resolves
saved/system theme preferences in `web/src/theme.ts`. The Swift application
uses `BirbTheme` in `ios/BirbPartyKit/Sources/BirbDesign/BirbTheme.swift` with
system typography and Dynamic Type. These currently implement a subset of the
roles below. This contract guides additions; it does not claim that all recipes,
contrast audits, or preview surfaces are already implemented on either client.

### Semantic role pairs

| Purpose | Light background / foreground | Dark background / foreground | Contrast |
| --- | --- | --- | --- |
| Base surface | `white` / `black` | `black` / `white` | 15.32:1 |
| Muted surface | `lightGray` / `black` | `black` / `white` | 7.42:1 / 15.32:1 |
| Raised surface | `white` / `black` | `darkGray` / `white` | 15.32:1 / 9.92:1 |
| Grouped surface | `lightGray` / `black` | `darkGray` / `white` | 7.42:1 / 9.92:1 |
| Emphasized grouped surface | `lightGray` / `black` | `darkBlue` / `white` | 7.42:1 / 10.31:1 |
| Primary action | `blue` / `white` | `cyan` / `black` | 5.31:1 / 12.37:1 |
| Primary action container | `darkBlue` / `white` | `lightBlue` / `black` | 10.31:1 / 6.43:1 |
| Secondary action | `darkCyan` / `white` | `lime` / `black` | 5.14:1 / 12.31:1 |
| Secondary action container | `purple` / `white` | `green` / `black` | 9.98:1 / 6.52:1 |
| Tertiary action | `green` / `black` | `yellow` / `black` | 6.52:1 / 11.43:1 |
| Tertiary action container | `lime` / `black` | `orange` / `black` | 12.31:1 / 6.21:1 |
| Filled error | `red` / `white` | `orange` / `black` | 5.18:1 / 6.21:1 |
| Error container | `purple` / `white` | `red` / `white` | 9.98:1 / 5.18:1 |
| Inverse surface | `black` / `white` | `white` / `black` | 15.32:1 |
| Action on inverse surface | `black` / `lightBlue` | `white` / `blue` | 6.43:1 / 5.31:1 |
| Outline and secondary outline | `black` on light surfaces | `lightGray` on dark surfaces | At least 4.8:1 |
| Hard shadow and scrim | `black` | `black` | Opaque shadow; platform scrim compositing permitted |

Mode-independent action pairs, if needed, use `darkBlue`/`white` or
`blue`/`white` for primary, `purple`/`white` or `darkCyan`/`white` for
secondary, and `lime`/`black` or `green`/`black` for tertiary. Their contrasts
are the matching values above. Approve a foreground only on its named
background; a related variant is not automatically a safe pairing.

### Status and interaction roles

| Role | Light fill / foreground | Dark fill / foreground | Contrast |
| --- | --- | --- | ---: |
| success | `green` / `black` | `lime` / `black` | 6.52:1 / 12.31:1 |
| warning | `orange` / `black` | `yellow` / `black` | 6.21:1 / 11.43:1 |
| info | `blue` / `white` | `lightBlue` / `black` | 5.31:1 / 6.43:1 |
| focus | `darkBlue` on assigned light surfaces | `cyan` on assigned dark surfaces | Safe lower bound 4.995:1 / 8.010:1 |
| disabled foreground/boundary | `gray` on assigned `white` surfaces | `lightGray` on assigned dark surfaces | Safe lower bound 4.91:1 / 4.804:1 |
| error indicator foreground/boundary | `purple` on `white`/`lightGray` | `yellow` on `black`/`darkGray`/`darkBlue` | Safe lower bound 4.832:1 / 7.399:1 |

The contrast column is contract data. Verification must recompute it from the
RGB values and compare the unrounded WCAG ratio with the required threshold.
Other displayed ratios are rounded to two decimal places and are not strict
lower bounds. In particular, do not approve `green` on `white`, `cyan` on
`white`, or `gray` on `lightGray` because it looks plausible.

### Assigned surface sets

Recipe role names below denote these semantic surfaces: `surface` is base,
`surfaceDim` is muted, `surfaceBright` is raised, `surfaceContainer` and
`surfaceContainerHighest` are grouped, and `surfaceContainerHigh` is emphasized
grouped. `surfaceContainerLowest` and `surfaceContainerLow` use the base pair.
`onSurface` and `onSurfaceVariant` use each surface’s foreground; `outline`
and `outlineVariant` use the outline pair. These names describe visual purposes,
not a required platform API.

The following closed sets define allowed adjacent surfaces. Base, muted,
raised, grouped, and emphasized grouped surfaces use the pairs above.

| Foreground/boundary | Light adjacent surfaces | Dark adjacent surfaces |
| --- | --- | --- |
| Surface text and variant text | All assigned surfaces | All assigned surfaces |
| Outline and secondary outline | All assigned surfaces | All assigned surfaces |
| Focus | All assigned surfaces | All assigned surfaces |
| Disabled | `white` only | `black`, `darkGray`, `darkBlue` |
| Error indicator | `white`, `lightGray` | `black`, `darkGray`, `darkBlue` |

Inspect input error and focused-error states on every assigned surface.
Disabled boundaries in light mode belong only on white because `gray` is not
3:1 against `lightGray`. Adding a surface or permitting a state on another
background requires updating this table and its exhaustive contrast checks
first. Current client coverage must be verified rather than assumed.

Status components combine color with a label, icon, border pattern, or shape.
Examples include success + check + “Live,” warning + triangle + “Degraded,”
and error + cross + correction text. These illustrate non-color cues; they do
not prescribe product copy before the corresponding feature exists.

Status, error, selection, and progress expose the same meaning to assistive
technology:

- visible labels participate in the accessible representation;
- decorative icons are excluded, while an icon-only cue has an accessible
  label;
- determinate progress exposes its current value and indeterminate progress
  has a meaningful label;
- important dynamic status and error updates use an appropriately scoped live
  region; and
- native checked, selected, toggled, enabled, and value semantics remain
  intact.

## 5. Foundation tokens

The React playback reload and media deletion controls implement the existing semantic `disabled`
role as `--disabled`: `gray` in light mode and `lightGray` in dark mode. Its
disabled state uses the primary-button recipe below, including the surface
fill and 1 px disabled boundary.
Media deletion buttons also implement the existing `primaryContainer` /
`onPrimaryContainer` pair for hovered and pressed states: `darkBlue` / `white`
in light mode and `lightBlue` / `black` in dark mode. Confirmation is an inline
semantic group on the base surface, rather than a modal dialog.

Native Library/Watch actions implement the same existing primary,
primary-container, disabled and focus roles in `BirbTheme`/`BirbMediaActionStyle`:
flat square primary fill, pressed/hovered primary-container pair, disabled base
surface with semantic foreground/boundary at 1 pt, and a 2 pt focus outline
separated by the existing 4 pt spacing token. `BirbLoading` uses an explicit
on-surface label and primary-tinted native progress indicator. Its native
indicator geometry/animation remains a platform-semantic control. Navigation
and destination roots consume the canonical saved appearance and paint the
base canvas/navigation background explicitly; appearance does not change
navigation identity. Actual repaired-state contrast and native focus/VoiceOver
inspection still require the exact-head Mac gate.

Dimensions are logical units: CSS pixels on web and points on iOS. Typography
sizes are baseline values that must respect browser text resizing and iOS
Dynamic Type rather than fixing text at its default scale.

- Spacing: 4, 8, 12, 16, 24, 32, and 48 logical pixels, named `space1`,
  `space2`, `space3`, `space4`, `space6`, `space8`, and `space12`.
- Borders: `thin` is 1 px; `strong` is 2 px.
- Radius: `none` is 0 px; `pixel` is 2 px and is used only when geometry or
  platform clipping needs a softened edge. Never apply one radius everywhere.
- Elevation: surfaces are flat by default. A component-specific,
  documented layering exception uses only `shadow` at offset `(2, 2)`, zero
  blur, and zero spread. Do not approximate it with diffuse platform elevation.
- Targets: every interactive control is at least 48×48 logical pixels. This
  also exceeds the iOS 44×44 minimum.
- Motion: `instant` is 0 ms, `fast` is 100 ms, and `standard` is 200 ms. Motion
  communicates state or continuity; it does not float, pulse, glow, delay
  content, or decorate scrolling. Custom motion honors
  the browser reduced-motion preference and iOS Reduce Motion setting.
- Typography uses the platform system typeface and preserves OS text
  scaling. Default text uses `onSurface`; variants select a semantic role.

| Text style | Size | Weight | Height |
| --- | ---: | ---: | ---: |
| `displayLarge` | 40 | 700 | 1.2 |
| `displayMedium` | 36 | 700 | 1.2 |
| `displaySmall` | 32 | 700 | 1.2 |
| `headlineLarge` | 28 | 700 | 1.25 |
| `headlineMedium` | 24 | 700 | 1.25 |
| `headlineSmall` | 20 | 700 | 1.25 |
| `titleLarge` | 20 | 600 | 1.3 |
| `titleMedium` | 16 | 600 | 1.3 |
| `titleSmall` | 14 | 600 | 1.3 |
| `bodyLarge` | 16 | 400 | 1.5 |
| `bodyMedium` | 14 | 400 | 1.5 |
| `bodySmall` | 12 | 400 | 1.5 |
| `labelLarge` | 14 | 700 | 1.3 |
| `labelMedium` | 12 | 700 | 1.3 |
| `labelSmall` | 11 | 700 | 1.3 |

## 6. Component recipes

The 0/2 px radius rule applies to authored container boundaries.
Preserve native radio, switch, and slider indicator geometry; this is an
explicit platform-semantics exception and does not authorize wrappers, custom
painting, or bespoke controls. Interactive controls use the 48 px target.
Combined states use this precedence:
**disabled; focused+error; error; pressed; focused; hovered; selected;
enabled**. A higher state overrides the same property from a lower state while
preserving independent cues such as a check, thumb position, disabled
semantics, or error correction text.

Explicit component-state rows are authoritative for every property they name.
The shared interaction table is a fallback only when a component row does not
assign that property. This specificity rule applies after the state-precedence
rule above.

| Component/state | Fill | Foreground | Boundary/elevation |
| --- | --- | --- | --- |
| application canvas | `surface` | `onSurface` | None |
| app bar, ordinary | `surface` | `onSurface` | No boundary; flat surface |
| app bar, separated | `surface` | `onSurface` | Bottom `outline` 1 px; flat surface |
| primary button, default | `primary` | `onPrimary` | Radius 0; elevation 0 |
| primary button, hovered | `primaryContainer` | `onPrimaryContainer` | Radius 0; elevation 0 |
| primary button, pressed | `primaryContainer` | `onPrimaryContainer` | Radius 0; elevation 0 |
| primary button, disabled | `surface` | semantic `disabled` | Disabled boundary 1 px |
| outlined button, default | `surface` | `onSurface` | `outline` 1 px |
| outlined button, hovered | `surfaceContainer` | `onSurface` | `outline` 1 px |
| outlined button, pressed | `surfaceContainer` | `onSurface` | `outline` 1 px |
| text/icon button, default | No authored fill | `primary` | No boundary until focus |
| text/icon button, hovered | `surfaceContainer` | `onSurface` | No elevation |
| text/icon button, pressed | `surfaceContainer` | `onSurface` | No elevation |
| outlined/text/icon button, disabled | `surface` | semantic `disabled` | Disabled boundary on outlined only |
| input, enabled | Caption `surfaceContainerLow`; editor `surface` | Caption `onSurfaceVariant`; editor `onSurface` | `outline` 1 px; caption occupies a separate ledger cell |
| input, focused | Caption `surfaceContainerLow`; editor `surface` | Caption `onSurfaceVariant`; editor `onSurface` | Semantic `focus` 2 px around the ledger |
| input, error | Caption `surfaceContainerLow`; editor `surface` | `errorIndicator` caption/message/icon; editor `onSurface` | `errorIndicator` 1 px plus external live correction row |
| input, focused+error | Caption `surfaceContainerLow`; editor `surface` | `errorIndicator` caption/message/icon; editor `onSurface` | `errorIndicator` 2 px plus external live correction row |
| input, disabled | Caption `surfaceContainerLow`; editor `surface` | semantic `disabled` | Disabled ledger boundary 1 px |
| checkbox, selected | Box `primary` | Check `onPrimary` | Check mark and checked semantics |
| checkbox, unselected | Box `surface` | n/a | `outline` 1 px and unchecked semantics |
| checkbox, disabled | Box `surface` | semantic `disabled` | Disabled side plus disabled semantics |
| radio, selected | Ring/dot `primary`; background `surface` | n/a | Inner dot and selected semantics |
| radio, unselected | Ring `outline`; background `surface` | n/a | Empty center and unselected semantics |
| radio, disabled | Ring `disabled`; background `surface` | n/a | Disabled semantics |
| switch, selected | Track `primary` | Thumb `onPrimary` | Thumb position and toggled semantics |
| switch, unselected | Track `surface` | Thumb `onSurface` | `outline` 1 px, position, and toggled semantics |
| switch, disabled | Track `surface` | Thumb/boundary `disabled` | Disabled semantics |
| slider | Active track/thumb `primary`; inactive track `outline` | Value indicator `onPrimary` on `primary` | Thumb position, semantic value, and exact focus overlay |
| card | `surfaceContainerLow` | `onSurface` | `outline` 1 px; radius 0; flat surface |
| chip, unselected | `surface` | `onSurface` | `outline` 1 px; radius 2 px |
| chip, selected | `primary` | `onPrimary` | Check/selection mark; radius 2 px |
| chip, disabled | `surface` | semantic `disabled` | Disabled boundary 1 px |
| dialog/menu | `surfaceContainerHigh` | `onSurface` | `outline` 1 px; radius 0; flat surface |
| snackbar/tooltip | `inverseSurface` | `onInverseSurface` | Radius/elevation 0; action uses `inversePrimary` |
| divider | n/a | `outline` | 1 px |
| navigation bar/rail, unselected | `surface` | `onSurfaceVariant` | Divider where separated |
| navigation bar/rail, selected | `primaryContainer` | `onPrimaryContainer` | Square indicator plus icon/label-weight cue |
| text selection/cursor/handle | `lightBlue` under light text; `blue` under dark text | Selected text remains `black`/`white` | Cursor and handle use `primary` |

Cards use boundaries only for real grouped objects. Chips are for filters,
selection, or compact status. Labels never rely on placeholders. Navigation
selection changes icon/label treatment as well as color. Dialogs, menus,
snackbars, and tooltips remain opaque.

An app bar is “separated” only while content is visibly scrolling beneath it.
Until a screen implements and tests that state, use the ordinary no-boundary
recipe. A hard-offset layering exception must name the component and reason in
this document before implementation.

### Shared interaction roles

| State | Fill/overlay | Foreground | Boundary/additional cue |
| --- | --- | --- | --- |
| hovered | `surfaceContainerHigh` | `onSurface` | Preserve base boundary and semantic cue |
| pressed | `primaryContainer` | `onPrimaryContainer` | Preserve shape/position cue |
| focused | Preserve base fill | Preserve base foreground | Semantic `focus` at 2 px where a stateful side exists; otherwise exact global focus token |
| selected | Component-selected recipe | Selected foreground | Check, position, square indicator, or label weight |
| disabled | `surface` | semantic `disabled` | Disabled boundary, semantics, and blocked action |
| error | `surface` | `errorIndicator` message/icon | `errorIndicator` 1 px and correction text |
| focused+error | `surface` | `errorIndicator` message/icon | `errorIndicator` 2 px |

### Platform implementation requirements

Use native semantic HTML controls in React and native SwiftUI controls on iOS.
Preserve platform radio, switch, slider, and selection geometry and behavior;
the square-container rule does not authorize bespoke painted controls.

Labeled inputs keep a persistent caption separate from the editable value.
At narrow widths or large text sizes, stack the caption above the value so
label and boundary never intersect. Put validation copy outside the editor in
a visible correction row, associate it with the input, and announce updates
appropriately. Inspect focus and focused-error boundaries on every allowed
surface. Placeholders do not substitute for labels.

Resolve authored disabled, pressed, focused, hovered, selected, and error
states explicitly using the precedence and recipe tables. Borderless controls
still need a visible semantic focus cue. Platform compositing of exact authored
interaction, scrim, and selection tokens is permitted; authored opacity or
alpha transformations of palette entries are not. Preserve native keyboard
behavior, selection cues, and assistive-technology state values.

## 7. Research into common AI-generated visual defaults

This section records recurring defaults, not a detector of authorship. Any one
pattern can be legitimate. The failure is using a formula without a product
reason. Sources checked for this contract on 2026-08-28:

- [Signs of AI Design](https://github.com/febbhav/signs-of-ai-design) catalogs
  patterns and explicitly frames possible false positives.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) defines contrast, non-color,
  focus, target-size, and related accessibility criteria.

| Common default | Birb Party counter-rule | Legitimate exception |
| --- | --- | --- |
| Purple/indigo gradient hero and gradient buttons | Use flat semantic roles; create hierarchy with type, spacing, and borders | Future game artwork may have separately reviewed art direction |
| Centered oversized headline, badge, subhead, and two generic calls to action | Derive composition from the user's task and real content | A centered empty state when it improves comprehension |
| Exactly three identical feature cards or a generic bento grid | Choose layout from content relationships and responsive constraints | Three genuine objects may form three columns when that relationship is useful |
| Large uniform rounding on every surface/control | Default to 0 px; use 2 px only for a named geometric need | Platform clipping or a documented component affordance |
| Nested cards for visual interest | Budget one boundary per meaningful grouped object | Nested interactive domain objects whose semantics remain clear |
| Glassmorphism, translucent blur, glow borders, diffuse elevation | Use opaque fills, crisp borders, and an optional hard offset | Media overlays only after contrast and performance verification |
| Decorative pill eyebrows and sparkle/bolt icon tiles | Reserve chips/icons for recognizable semantics | A real status/filter chip or required AI-feature disclosure |
| Floating, pulsing, parallax, and reveal-on-scroll ornament | Animate state, causality, loading, or spatial continuity only | Behavior that cannot be understood as clearly without motion |
| Generic hype copy and fake metrics | Use domain terms, concrete actions, real states, and actual data | None |

### Pre-merge anti-template check

1. Does each container represent a real object or interaction boundary?
2. Does each color, icon, effect, and animation communicate a named purpose?
3. Does layout follow content and user task rather than a stock hero/card
   formula?
4. Could removing a decorative element improve comprehension without losing
   meaning? If yes, remove it.
5. Did a new exception update this document and pass contrast, semantics, and
   responsive checks?

## 8. Accessibility and responsive requirements

- Target WCAG 2.2 AA for web and equivalent native iOS accessibility
  requirements.
- Normal text reaches 4.5:1; large text reaches 3:1; meaningful non-text
  boundaries and states reach 3:1; focus is visibly distinguishable.
- Status, error, selection, and progress retain a color-independent cue.
- Verify labels, live-region updates, progress values, and native
  checked/selected/toggled/enabled/value states in both modes.
- Layout remains readable at the largest supported text scale and at narrow
  mobile widths.
- Controls remain semantic platform controls with accessible labels, not
  painted-pixel replacements.
- Keyboard access and focus order remain intact on web and desktop.
- Verify 48×48 logical-pixel targets on web and 48×48-point targets on iOS,
  exceeding the iOS 44×44 minimum.

Inspect the actual React and Swift screens in light and dark modes, including
error, disabled, focus, selection, and loading states that those screens expose.
Run `npm run verify` from `web/` and `ios/scripts/verify.sh` from the root for
the existing automated gates; these do not replace browser and target-device
visual/accessibility inspection. There is no shared theme-preview harness.
If an automated scanner cannot evaluate an unpainted or disabled state,
retain direct contrast and rendered-state verification and document the scanner
limitation. Do not weaken the contract to satisfy a scanner limitation.

## 9. Contribution checklist

Before merging a new screen or component:

- [ ] Consume semantic theme roles instead of raw primitive palette values.
- [ ] Use an existing spacing, radius, border, and motion token.
- [ ] Verify both light and dark modes.
- [ ] Test required contrast and a non-color cue.
- [ ] Test large text and a narrow width.
- [ ] Inspect keyboard focus and semantics.
- [ ] Run the anti-template check.
- [ ] Document any new token or justified exception before merge.

## Deferred work

High-contrast themes, a licensed brand or pixel-display font, golden
infrastructure, product-specific streaming components, and static analyzer
integration are separate design decisions. They are not exceptions to this
contract and are not part of the initial design-system implementation.
