---
name: Pointer-gesture carousels and 3D card stacks
description: Non-obvious browser behaviours that break drag carousels whose cards also contain buttons and links.
---

## Capture the pointer lazily, never on pointerdown

Calling `setPointerCapture` in `pointerdown` retargets the subsequent `click`
event to the capturing element. Any button or link inside the dragged area
then never fires.

**Why:** the click target is resolved against the capture element, not the
element under the cursor. This silently kills click-to-activate on every child
control, and it looks like a React handler bug rather than a DOM one.

**How to apply:** take capture only once movement crosses a drag threshold
(~6px). Below the threshold the pointer is still over the origin element, so
you keep receiving `pointermove` without capture. Track a `moved` flag and use
it to swallow the click that terminates a real drag.

## Lazy capture needs a window-level terminal-event fallback

Without capture, a gesture that starts on the element and ends outside it
never delivers `pointerup` to that element, so the dragging flag stays set and
the settle/animation loop wedges.

**Why:** element-scoped pointer handlers only see events over that element.
**How to apply:** whenever capture is conditional, also listen for `pointerup`
and `pointercancel` on `window`, matched by `pointerId`, and run the same
cleanup.

## `filter: blur()` flattens a 3D rendering context

Applying a CSS filter to an element makes it a containing block that flattens
transforms, so descendant `translateZ` stops composing with the parent's
perspective.

**How to apply:** in depth-sorted card fans, keep blur at exactly 0 for any
card that relies on inner `translateZ` (usually the centred/expanded one), or
apply the blur to a wrapper that has no 3D descendants.

## A CSS mask turns a zero-height container into an invisible one

`h-full` (i.e. `height: 100%`) on the child of a flex item resolves against a
parent whose height came from `flex-grow`, which is not always a definite
height — so the child collapses to zero.

**Why:** a masked container that collapses does not merely shrink, it vanishes
completely, because `mask-size: 100% 100%` of a zero-height box makes every
pixel transparent. Absolutely-positioned children disappear with it, so the
symptom is "my whole fan rendered nothing" with no layout clue and no console
error.

**How to apply:** when a masked box must fill a flex item, position it
`absolute; inset: 0` inside a `relative` flex item rather than relying on a
percentage height. Sizing the fan container this way also lets the bottom fade
land on the viewport edge instead of an arbitrary fixed box.

## A fading overlay inside the card must not take pointer events

Once the card carries a reveal block (description + link) that fades in over
most of the tab, giving that *container* `pointer-events: auto` while it is
visible silently breaks click-to-collapse: the container, not the underlying
activation button, receives the click.

**Why:** the reveal covers the middle of the card, which is exactly where a
user (and any test harness clicking an element's centre) clicks to toggle it.
The card looks interactive and expands fine — only collapsing fails, which
reads like a state bug rather than a hit-testing one.

**How to apply:** keep `pointer-events: none` on the reveal container
permanently and grant `auto` only to the link inside it, gated on the revealed
state. Gate it: a link that is invisible but clickable will fire instead of
expanding on touch, where there is no hover to reveal it first. Remember a
child's `pointer-events: auto` overrides an ancestor's `none`, so a blanket
link rule needs an explicit resting override to stay inert.

## Absolutely-positioned pseudo-elements paint over static siblings

A decorative `::before` (e.g. a raised tab step drawn behind a number) paints
*above* the element's static in-flow content, because positioned boxes paint
after non-positioned ones in the same stacking context — no z-index involved.

**How to apply:** give the content that must sit on top `position: relative`.
It then paints in tree order after the pseudo-element. Reaching for a negative
z-index instead usually pushes the decoration behind the card background too.

## Card-level activation control plus links inside the card

Putting anchors inside an element with `role="button"` is nested interactive
content; assistive tech can flatten the descendants away.

**How to apply:** make the activation control a real `<button>` positioned
`absolute; inset: 0` as a *sibling* of the visual panel. Give the panel
`pointer-events: none` and the links `pointer-events: auto`. Clicks anywhere
except the links reach the button, the links stay independently focusable, and
nothing is nested. Drive hover/focus choreography from `:hover` and
`:focus-within` on the outer card wrapper so both the control and the links
trigger it.
