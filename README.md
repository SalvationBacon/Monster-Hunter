# Monster-Hunter

A mobile monster-hunting game: hunt, loot, craft, hunt something bigger. Pixel art drawn in code, the same way as 8-Bit Industry.

**Current state: prototype (v0.12.0).** 35 monsters (30 in six ranks, four apex monsters and an elder) on five body types, seven elements and four statuses, four weapon types, perks, upgrades, and a camp with a forge, kitchen, quests, expeditions, a terrarium and a companion.

## Play
Open `index.html` in a browser. It is one file with no dependencies. Progress is saved on the device.

| Input | Action |
|---|---|
| Tap | Attack (three-hit combo) |
| Tap a red circle | Weak-point hit. Three on the same part break it |
| Hold | The weapon's skill: charge (greatsword, hammer), keep slashing (dual blades), guard (lance) |
| Swipe left or right | Dodge roll. Dodge just as the ring closes for a PERFECT, then tap COUNTER |
| Swipe up, or the potion button | Drink a potion |
| Swipe down, or the whetstone button | Sharpen the weapon |

Keyboard: `J` or `Space` attack (hold for the weapon skill), `A`/`D` dodge, `W` potion, `S` sharpen.

## The loop
1. **Quests** tell you what to do next. The main story is the tutorial.
2. **Hunt** a monster from the prep screen, where you see its weaknesses and pick a meal. Break its parts for their drops.
3. **Expeditions:** gather runs give ingredients and creatures; pack hunts give meat and common materials.
4. **Forge** materials into weapons, armor, charms and coatings, and upgrade them. **Cook** potions; meals are chosen in prep.
5. Three wins in a rank open the next rank. The four apex monsters open after rank 6, and the elder after all four apex monsters.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole game |
| `tools/check.js` | Headless test: bots play full hunts with every weapon type and up the whole monster ladder, then every system and the real touch flows are checked. `node tools/check.js` (needs Playwright) |
| `concepts/` | Tone mockups and the design decisions so far |
