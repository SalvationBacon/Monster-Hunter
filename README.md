# Monster-Hunter

A mobile monster-hunting game: hunt, loot, craft, hunt something bigger. Pixel art drawn in code, the same way as 8-Bit Industry.

**Current state: fight prototype (v0.4.2).** One hunt of about a minute against one monster, the Fernwing, to test how combat feels.

## Play
Open `index.html` in a browser. It is one file with no dependencies.

| Input | Action |
|---|---|
| Tap | Attack (three-hit combo). Tap the head or tail to aim at it |
| Hold, then release | Charged heavy hit, three levels |
| Swipe left or right | Dodge roll. Dodge just as the ring closes for a PERFECT, then tap COUNTER |
| Swipe up, or the potion button | Drink a potion |

Keyboard: `J` or `Space` attack the head (hold to charge), `K` the tail, `A`/`D` dodge, `W` potion.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole game |
| `tools/check.js` | Headless test: bots play full hunts, then real touch input is checked. `node tools/check.js` (needs Playwright) |
| `concepts/` | Tone mockups and the design decisions so far |
