# Design decisions so far

- **Core loop:** hunt → loot monster parts → craft themed gear → unlock bigger monsters.
- **Combat:** style B, tap to attack, swipe to dodge, hold to block or charge. Monsters telegraph attacks with a wind-up "!" glow.
- **Hunt length:** about 1 minute per hunt (3 minutes was tried in v0.1.0 and felt far too long).
- **Business model:** pure fun. No energy timers, no gacha, no ads.
- **Art pipeline:** same as 8-Bit Industry. Every sprite is drawn procedurally in code on tiny canvases, scaled up with smoothing off, with no image files. The mockups add an auto-shade and outline pass on top (`concepts/tone-examples.html`).
- **Tone:** B, classic adventure (see `concepts/tone-examples.png`).

## The fight

- **Controls:** tap attacks on press (three-hit combo), a held press charges a heavy hit (three levels), a swipe left or right dodges, a swipe up drinks a potion. There is no block yet.
- **Telegraphs:** a "!" over the monster, and a ring that closes on the hunter for each hit on its way. A dodge in the last 0.2s is a PERFECT: slow motion, stamina back, and a COUNTER button appears for 1.4s.
- **Counter:** tapping the button makes the hunter dash in for a big head hit that knocks the monster out of its attack and fills 40% of the stun meter.
- **Stun:** head hits fill a stun meter (counters most, charged hits next, taps a little). When it fills the monster is down for 4 seconds and takes 25% more damage. Each stun makes the next one need more.
- **Fernwing:** 3100 HP, three phases (at 2/3 and 1/3 health it roars and speeds up). Attacks: bite, tail sweep, double bite, fire breath (two hits), dive.
- **Monster dodge:** between its attacks the monster turns wary (wings up, no other marker) every few seconds, more often in later phases. The next hit on a wary monster misses as it hops back for about a second, with a "DODGED!" label. It never dodges while attacking, recovering or stunned, so those are the safe times to hit.
- **Breakable parts (weak points):** head, wings and tail. Every 2 to 3 seconds a red circle shrinks onto one part, taking turns between the unbroken parts, and the player has 0.5s to tap it. Three hits on a part break it: the monster staggers and that part's drop is guaranteed. Normal hits no longer break parts. A one-minute hunt has room for about nine circles, so breaking all three takes near-perfect taps.
- **Balance (bots, `tools/check.js`):** see the numbers the script prints. A bot that never stops attacking should win in about 45 seconds, so a person lands near a minute.

## The loop around the fight (v0.6.0)

- **Camp:** after the title, a camp screen with two tabs. HUNT lists the monsters; FORGE lists the gear.
- **Gear slots:** one weapon (attack), one armor (health) and one charm (a perk). Crafting spends materials and equips the piece. Progress is saved on the device.
- **Monsters are data:** health, damage, attack speed per phase, attack pools, circle speed, dodge frequency, stun threshold and loot table live in one `MONSTERS` table, so a new monster is mostly a new entry plus its sprite.

| Monster | Health | Damage | Circle | Unlock |
|---|---|---|---|---|
| Fernwing | 3100 | x1 | 0.50s | from the start |
| Emberwing | 5400 | x1.5 | 0.38s | first Fernwing win |

The Emberwing also attacks faster, dodges more often and has a triple bite.

| Gear | Slot | Effect | Cost |
|---|---|---|---|
| Fern Blade | weapon | attack +30% | 6 scale, 3 claw, 1 horn |
| Fern Mail | armor | health 140 | 8 scale, 2 claw, 1 wing |
| Keen Eye Charm | charm | circles close 40% slower | 1 horn, 1 wing, 1 tail spike |
| Ember Greatsword | weapon | attack +70% | 6 ember scale, 3 ember claw, 2 ember horn |
| Ember Plate | armor | health 190 | 8 ember scale, 2 ember wing, 6 fern scale |
| Breaker Charm | charm | breaks need 2 hits | 2 club tail, 1 ember horn, 2 tail spike |

- **Balance (bots, `tools/check.js`):** an average bot beats the Emberwing about half the time in starter gear, reliably in Fernwing gear (about a minute), and faster in Emberwing gear.

## Decided for later (not built yet)

- **More gear perks for part breaking:** a bigger tap area, or circles that favour one chosen part.
- **Harder monsters keep closing circles faster** (0.3s was discussed).
