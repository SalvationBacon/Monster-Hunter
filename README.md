# Fernwing Hunt

A mobile monster-hunting game: hunt, carve, forge, hunt something bigger. Every monster, weapon and piece of armour is drawn in code by its own little art engine, and the music is composed in the browser as it plays.

**The game is live (v0.39): play it at https://salvationbacon.github.io/Monster-Hunter/**

It runs in any modern browser, on a phone or a computer. There's nothing to install, and progress is saved on the device.

## What's in it
- **35 monsters from myth**, each with its own body, animations and two signature moves: wyverns and Western dragons, a three-headed zmey, a sky lung with its pearl, a hydra, a basilisk king cobra, a tarasque, a griffin, a roc and more. Six ranks of five, four apex monsters and the Hollow Star at the end.
- **Four weapons**, each with its own skill: the greatsword and hammer charge, the dual blades build fury for a Blade Dance, and the lance guards.
- **Monsters that fight back:** combos, held wind-ups and feints, openings after their big moves, and rage in their last third of health.
- **Rank Trials:** to move up a rank, beat three of its monsters back to back, with no break, one timer and five potions. The first clear gives that rank's Crest charm.
- **Expeditions:** fight a biome's Snapjaw pack and forage in the lulls between kills, with the odd treasure cache, passing giant or alpha.
- **Gear:** every monster gives a weapon of each type, four armour pieces that look like it, a charm, and gear for Pip. There are 19 levelled skills, set bonuses and upgrades.
- **The camp:** quests and a story, the forge, a kitchen for potions and meals, a bestiary, a terrarium of 32 creatures, and Pip, a companion who fights, heals, traps, scouts or gathers for you.

## How to play
| Input | Action |
|---|---|
| Tap | Attack (a three-hit combo). Every swing costs stamina |
| Tap a red circle | Hit a weak point. Three hits on the same part break it, and broken parts drop extra materials (you keep them even if the hunt fails) |
| Hold | The weapon's skill: charge (greatsword, hammer), Blade Dance from built-up fury (dual blades), guard (lance) |
| Swipe left or right | Dodge roll. Roll just as the ring closes for a PERFECT, then tap COUNTER |
| Swipe up, or the potion button | Drink a potion |
| Swipe down, or the whetstone button | Sharpen the weapon |
| Pause button (top right) | Pause: resume, music and sound on or off, or quit the hunt |

Keyboard: `J` or `Space` attack (hold for the weapon skill), `A`/`D` dodge, `W` potion, `S` sharpen, `P` or `Esc` pause.

**Stamina:** swings, charging and rolls all use it. Run it dry and you're **winded**: no swinging or rolling until you catch your breath. Keep enough in hand to roll; a perfect dodge gives some back.

## The loop
1. **Quests** tell you what to do next. The story's first chapters are the tutorial.
2. **Hunt** a monster from the prep screen, where you see its weaknesses and pick a meal. Break its parts for their drops.
3. **Forge** materials into weapons, armour, charms and Pip's gear, and upgrade them. Wear a weapon whose element the next monster is weak to.
4. **Move up:** monsters open one at a time. Beat a rank's last monster to open its Rank Trial; clear the trial to open the next rank. The Apex Trial opens the Hollow Star.
5. **Expeditions** fill the kitchen and the terrarium: ingredients, creatures, meat and common materials.

## Options
SETTINGS on the title screen or in the camp menu: music and sound on or off, **dev mode** (every monster and piece of gear unlocked, on its own save, so your real progress is safe), and **delete save** (tap twice to confirm).

## Music
An original score, composed in the browser as it plays: each track is a recipe that becomes notes on the fly, keeping its hook while the accompaniment changes each time. The title, the camp, expeditions (with their own foraging theme in the lulls) and the Snapjaw packs have their own tracks. Every monster's theme is a variation on its element's motif, moved to its own key and tempo, with a lead voice from its body and drums from its trait. The Hollow Star has a hand-made track.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole game, in one file |
| `art/*.js` | The art engine and every monster, the hunter, weapons, icons and signature moves. Run `python3 tools/build-art.py` after editing them to inline them into `index.html` |
| `tools/check.js` | Headless test: bots play full hunts with every weapon type and up the whole monster ladder, then every system and the real touch flows are checked. `node tools/check.js` (needs Playwright) |
| `concepts/` | The design decisions (`DECISIONS.md`), the to-do list (`TODO.md`) and the signature move list (`MOVES.md`) |
