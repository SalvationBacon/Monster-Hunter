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

## The loop around the fight (v0.8.0)

- **Camp:** after the title, a camp screen with two tabs. HUNT lists the monsters; FORGE has a page of gear per monster, a starter page and a relics page.
- **Gear slots:** one weapon, one armor and one charm. Crafting spends materials and equips the piece. Progress is saved on the device.
- **Everything is data:** monsters, weapon types, perks and gear are tables at the top of `index.html`. Gear is generated from them, so a new monster brings its weapons, armor and charm with it.

### Monsters

| Monster | Body | Health | Damage | Circle | Element | Weak to | Unlock |
|---|---|---|---|---|---|---|---|
| Fernwing | wyvern | 3100 | x1 | 0.50s | nature | fire | from the start |
| Tuskhide | brute | 4800 | x1.25 | 0.45s | earth | nature | Fernwing |
| Emberwing | wyvern | 5800 | x1.5 | 0.38s | fire | earth | Tuskhide |
| Frostmaw | brute | 7800 | x1.8 | 0.34s | ice | fire | Emberwing |
| Stormwing | wyvern | 10500 | x2.1 | 0.30s | thunder | ice | Frostmaw |

Later monsters also attack faster and dodge more often. New attacks: rush (Tuskhide, Frostmaw), triple bite, and lightning bolts (Stormwing). Each monster is weak to the element of the one before it, except the Fernwing (fire) and the Frostmaw (fire).

### Weapon types

All four are owned in iron from the start. A weapon of a monster's tier costs its scales, claws and one part.

| Type | Hits per second | Hold | Notes |
|---|---|---|---|
| Dual Blades | 5.2 | keep slashing for +20% damage, on stamina | cheaper dodge, weaker counter |
| Lance | 3.3 | guard: a hit costs stamina and 20% damage | a guard raised in the last 0.3s is perfect and opens a counter |
| Greatsword | 2.3 | charge a heavy hit, three levels | the all-rounder |
| Hammer | 1.7 | charge a heavy hit | every hit builds stun, head hits most |

All four deal the same damage per second with taps alone (about 44 in iron, measured by `tools/check.js`, which fails if they drift more than 6% apart). Slower weapons hit harder per swing. The brief freeze on each hit scales with the hit, so fast weapons do not lose more time to it.

A weapon does 25% more damage to a monster weak to its element.

### Tiers

| Tier | Attack | Armor health | Armor perk | Charm perk |
|---|---|---|---|---|
| Iron | x1.0 | 100 | none | none |
| Fern | x1.3 | 140 | Tireless | Keen Eye |
| Tusk | x1.5 | 170 | Guardian | Bludgeoner |
| Ember | x1.75 | 200 | Might | Breaker |
| Frost | x2.05 | 240 | Nimble | Herbalist |
| Storm | x2.4 | 290 | Keen Edge | Fortune |

### Upgrades and resistance

- **Levels:** every weapon and armor can be upgraded to +5 at the forge. Each level adds 8% of its base attack or health, so +5 is 40% more. Charms have no levels.
- **Costs:** levels 1 and 2 take scales and claws, level 3 adds a part, and levels 4 and 5 also need scales from the next monster up. Iron and leather use Fernwing materials.
- **Why:** an upgraded older weapon stays worth using where its element has the edge. A Fern weapon at +5 (x1.82) with the 25% element bonus is about level with a fresh Storm weapon.
- **Resistance:** armor takes 25% less damage from its own monster's element. The hunt card shows each monster's element, and "-25%" when the worn armor resists it.
- **Not a tree yet:** upgrades are a straight line of levels. Branching paths, where one weapon turns into another, are not built.

### Perks

Perks are kept modest on purpose (most are 10% to 40% on one narrow thing), to leave room for a rebirth system later.


Modelled on Monster Hunter's skills, under their own names.

| Perk | Effect |
|---|---|
| Tireless | dodge costs 40% less stamina |
| Guardian | 1 in 4 hits does half damage |
| Might | attack +10% |
| Nimble | longer dodge and perfect-dodge windows |
| Keen Edge | 20% chance of a critical hit for x1.5 |
| Keen Eye | weak-point circles close 40% slower |
| Bludgeoner | stun builds 40% faster |
| Breaker | parts break in 2 hits |
| Herbalist | one more potion, and potions heal 50% more |
| Fortune | one more of each common drop, better odds on parts and gems |
| Quick Draw (relic) | charge 30% faster |
| Riposte (relic) | counter damage +40% |
| Weak Spot (relic) | head damage bonus rises from 15% to 40% |

Relic charms each cost a Wyvern Gem (8% drop from any monster) plus parts from two monsters.

- **Balance (bots, `tools/check.js`):** each iron weapon type beats the Fernwing in about 45 seconds. An average bot beats every monster in the gear of the one before it in 45 to 65 seconds, and takes longer or loses in gear two tiers old.

## Decided for later (not built yet)

- **More gear perks for part breaking:** a bigger tap area, or circles that favour one chosen part.
- **Ranged weapons** (bow), which need aiming and are a bigger change to the fight.
- **Branching upgrade trees and armor in several pieces**, as in Monster Hunter.
- **A rebirth system** at the end of the ladder. Perks are sized with this in mind.
