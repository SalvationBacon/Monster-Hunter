# Monster-Hunter

A mobile monster-hunting game: hunt, loot, craft, hunt something bigger. Pixel art drawn in code, the same way as 8-Bit Industry.

**Current state: prototype (v0.8.0).** Five monsters, four weapon types, elements, thirteen perks, gear upgrades, a camp to pick hunts from, and a forge that turns loot into gear.

## Play
Open `index.html` in a browser. It is one file with no dependencies. Progress is saved on the device.

| Input | Action |
|---|---|
| Tap | Attack (three-hit combo) |
| Tap a red circle | Weak-point hit. Three on the same part break it |
| Hold | The weapon's skill: charge (greatsword, hammer), keep slashing (dual blades), guard (lance) |
| Swipe left or right | Dodge roll. Dodge just as the ring closes for a PERFECT, then tap COUNTER |
| Swipe up, or the potion button | Drink a potion |

Keyboard: `J` or `Space` attack (hold for the weapon skill), `A`/`D` dodge, `W` potion.

## The loop
1. Hunt a monster. Break its head, back or wings, and tail for their drops.
2. Forge its materials into weapons of its element, an armor and a charm, each with a perk.
3. Upgrade weapons and armor up to +5 to keep an element you need in play.
4. Each first win unlocks the next monster. Every monster is weak to one element, and armor resists its own monster's element.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole game |
| `tools/check.js` | Headless test: bots play full hunts with every weapon type and up the whole monster ladder, then the camp and real touch input are checked. `node tools/check.js` (needs Playwright) |
| `concepts/` | Tone mockups and the design decisions so far |
