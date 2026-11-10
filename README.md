# Monster-Hunter

A mobile monster-hunting game: hunt, loot, craft, hunt something bigger. Pixel art drawn in code, the same way as 8-Bit Industry.

**Current state: prototype (v0.6.0).** Two monsters, a camp to pick hunts from, and a forge that turns loot into gear.

## Play
Open `index.html` in a browser. It is one file with no dependencies. Progress is saved on the device.

| Input | Action |
|---|---|
| Tap | Attack (three-hit combo) |
| Tap a red circle | Weak-point hit. Three on the same part break it |
| Hold, then release | Charged heavy hit, three levels |
| Swipe left or right | Dodge roll. Dodge just as the ring closes for a PERFECT, then tap COUNTER |
| Swipe up, or the potion button | Drink a potion |

Keyboard: `J` or `Space` attack (hold to charge), `A`/`D` dodge, `W` potion.

## The loop
1. Hunt the Fernwing. Break its head, wings and tail for their drops.
2. Forge its materials into the Fern Blade, Fern Mail and Keen Eye Charm.
3. The first win unlocks the Emberwing, which is tougher and has faster circles. Its gear is stronger again.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole game |
| `tools/check.js` | Headless test: bots play full hunts against both monsters in each gear set, then the camp and real touch input are checked. `node tools/check.js` (needs Playwright) |
| `concepts/` | Tone mockups and the design decisions so far |
