# Design decisions so far

- **Core loop:** hunt → loot monster parts → craft themed gear → unlock bigger monsters.
- **Combat:** style B, tap to attack, swipe to dodge, hold to block or charge. Monsters telegraph attacks with a wind-up "!" glow.
- **Hunt length:** about 3 minutes per hunt.
- **Business model:** pure fun. No energy timers, no gacha, no ads.
- **Art pipeline:** same as 8-Bit Industry. Every sprite is drawn procedurally in code on tiny canvases, scaled up with smoothing off, with no image files. The mockups add an auto-shade and outline pass on top (`concepts/tone-examples.html`).
- **Tone:** B, classic adventure (see `concepts/tone-examples.png`).

## Fight prototype (v0.1.0)

- **Controls:** tap attacks on press (three-hit combo), a held press charges a heavy hit (three levels), a swipe left or right dodges, a swipe up drinks a potion. There is no block yet.
- **Telegraphs:** a "!" over the monster, and a ring that closes on the hunter for each hit on its way. A dodge in the last 0.2s is a PERFECT: slow motion, stamina back and a short damage boost.
- **Fernwing:** 9000 HP, three phases (at 2/3 and 1/3 health it roars and speeds up). Attacks: bite, tail sweep, double bite, fire breath (two hits), dive.
- **Breakable parts:** tap the head or tail to aim there. Breaking one staggers the monster and guarantees that part's drop.
- **Balance (bots, `tools/check.js`):** a bot that never stops attacking wins in about 2:15, so a person should land near 3 minutes. A bot that dodges 70% of hits wins with no potions left; one that never dodges faints.
