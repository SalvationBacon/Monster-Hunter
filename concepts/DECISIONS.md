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

## The loop around the fight

- **Camp:** after the title, a camp screen with two tabs. HUNT lists the monsters; FORGE has a page of gear per monster, a starter page and a relics page.
- **Gear slots:** one weapon, one armor and one charm. Crafting spends materials and equips the piece. Progress is saved on the device.
- **Everything is data:** monsters, weapon types, perks and gear are tables at the top of `index.html`. Gear is generated from them, so a new monster brings its weapons, armor and charm with it.

### Monsters (v0.12.0)

35 monsters, all defined in one table (`ROSTER` in `index.html`), one line each: name, body, arena, element, what its weapons carry, weak element, weak status, the status it inflicts, a trait, its moves, its colours and look flags. Stats come from its place in the order.

- **Ranks:** 30 base monsters in six ranks of five, then four apex monsters (rank 7) and the elder (rank 8). The Fernwing opens rank 1; three wins in a rank open the next; the apex rank opens after three rank 6 wins; the elder needs all four apex monsters.
- **Scaling:** a monster's damage, attack speed, circle speed and dodge rate climb down the order, and its health matches the gear of the monster before it. Apex monsters have 1.5x health and 1.15x damage on top; the elder 1.8x and 1.12x over the strongest apex.
- **Bodies:** wyvern, brute, serpent (coiled, with a neck fin), raptor (beaked biped) and crab (shelled, one great claw, a stinger). Each monster has its own colours and look flags (tusks, a club tail, glowing spines, a hot mouth, the elder's second pair of wings and starlit chest).
- **Arenas:** forest, volcano, desert, tundra, storm peaks, swamp, coast, ruins, and the summit under the Hollow Star.
- **Moves:** a shared library of 25 moves plus five of the elder's own (starfall, beam, comet, nova, eclipse). Every monster draws six or seven, and no two monsters share a set. New animations: a double tail spin, and a burrow where it sinks out of sight and bursts up beside the hunter.
- **Traits:**

| Trait | What it does | Monsters |
|---|---|---|
| Armored | hits do x0.6 until it is winded after its own attack, then x1.4 | Tuskhide, Cinderhide, Icehide, Ruinhorn, Gloomtusk |
| Charge | a meter fills; overcharged it is faster and harder. Stuns, breaks and counters knock it out | Stormwing, Skyrender, the Hollow Star |
| Shell | sometimes tucks in for 2.2s: hits do x0.25 and dull the blade twice as fast | Mudclaw, Shellsnap, Magmaclaw, Crystalback, Dusksting, Pyreclaw |
| Burrow | its burrow attack takes it under the ground, where it cannot be hit | Bogmaw, Sandeel, Tidecoil, Abysscoil, Tidereaver |
| Regen | heals 0.8% a second when left alone for 3s | Thornback, Mirefang, Aurorawing |
| Frenzy | winds up to 25% faster as its health falls | Gustraptor, Venomsting, Voltwing, Obsidwing, Tempestbeak |

- **Statuses monsters inflict:** poison, burn, freeze (as before), plus soaked (stamina returns at 40%), blight (the weapon's element and status do nothing), bleeding (hurts only while acting; standing still 1.5s stops it), stench (no potions; two rolls air it out), numb (cannot act for 1.4s) and mud (the next roll costs 80% more and shakes it off).
- **Elements:** water and dragon join, making seven. Every element and status is some monster's weakness.

### The story's end

The main story now has 15 chapters. The middle chapters follow the ranks as the glow spreads; "Four Heralds" asks for all four apex monsters, and "The Hollow Star" is the final hunt. The last chapter closes the story for now.

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

Each monster's weapons carry either its element or a status, never both (statuses are no longer coatings, as of v0.12.0).

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

### Weapon statuses, sharpness and rare drops (v0.10.0)

- **Status weapons:** some monsters' weapons build a status instead of carrying an element. Build-up is half the hit's base damage, so every weapon type builds at the same rate, and the threshold grows 40% each time.

| Status | Trigger | Effect |
|---|---|---|
| Poison | 220 | 8s of damage, 12 x attack per half second. Never lands the kill |
| Sleep | 260 | asleep for 5s, or until hit. The hit that wakes it does x2.5 |
| Blast | 180 | one explosion for 150 x attack |
| Paralysis | 300 | the monster is held still for 3s |

- **Every monster is weak to one element and one status**, as in Monster Hunter, and resists the status it uses itself. A weak status builds 50% faster, a resisted one half as fast.

Each monster's weaknesses are in the roster table. A monster resists the status its own weapons carry, or the status it inflicts.

- **Sharpness:** a meter that wears with every hit, by the hit's base damage. Above 60 the edge is keen (+10% damage), below 25 it is dull (-25%). It dulls after about 25 seconds of steady hitting. Sharpening takes 1.3s (whetstone button, or swipe down), leaves the hunter open, and a hit interrupts it.
- **Rare drops:** every monster has one (Heartleaf, Ivory Core, Magma Heart, Rime Heart, Storm Core). The chance per win is 3%, plus 3% for each broken part, plus 0.5% for every win since the last one, doubled by Fortune. The +5 upgrade of that monster's gear needs one.

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

## Camp systems (v0.11.0)

The camp has five tabs: HUNT, FORGE, COOK, QUEST and BUGS.

- **Prep screen:** every hunt starts here. It shows the monster's weak element and status, its own element, its signature tip, the worn weapon and coating (marked when they are a good or bad pick), potions coming along, a meal chooser, and the companion's role.
- **Potions** are brewed in the kitchen (3 herbs each). Three come on a hunt (four with Herbalist), never more than are in stock. A new save starts with six.
- **Meals:** one per hunt, cooked from ingredients when the hunt starts.

| Meal | Effect | Ingredients |
|---|---|---|
| Hearty Stew | health +25% | 2 meat, 2 herb |
| Spiced Skewer | attack +10% | 2 meat, 1 spice |
| Antidote Salad | cannot be poisoned | 3 herb, 1 pear |
| Cool Tonic | cannot be set alight | 2 pear, 1 honey |
| Warm Broth | cannot be frozen | 2 pepper, 1 meat |
| Grilled Icefish | edge lasts twice as long | 1 icefish, 1 spice |
| Runner Wrap | stamina returns 40% faster | 1 pear, 2 herb |
| Lucky Dumpling | rare drop odds +50% | 2 honey, 1 ash root |
| Honey Cake | potions heal 50% more | 2 honey, 1 herb |
| Stormcap Soup | the Stormwing charges 40% slower | 2 stormcap, 1 meat |
| Hunter Feast | health +10%, attack +5% | 2 meat, 1 skyfruit, 1 pepper |
| Bean Broth | no mud or stench | 2 bog bean, 1 meat |
| Marsh Lily Tea | cannot bleed | 1 marsh lily, 2 herb |
| Kelp Wrap | cannot be soaked | 2 kelp, 1 meat |
| Clam Chowder | health +15%, cannot be numbed | 2 clam, 1 meat |
| Glowcap Pie | cannot be blighted | 2 ruin fig, 1 glowcap |

New ingredients: bog bean and marsh lily (swamp), kelp and clam (coast), ruin fig and glowcap (ruins).

- **Expeditions** cover eight biomes (v0.14.0): forest, swamp, desert, volcano, coast, tundra, ruins and storm peaks. Each opens with the first monster that lives there (Fernwing, Mudclaw, Tuskhide, Emberwing, Shellsnap, Frostmaw, Dreadbeak, Stormwing). The list scrolls.
  - **Gather run (25s):** ingredients pop up and are tapped before they vanish. Each biome has a common and a scarce ingredient (12% of pop-ups, gone sooner). A creature crosses every few seconds inside a closing circle; tapping it catches it.
  - **Pack hunt:** three Snapjaws, one after another, with the normal combat. No parts to break. Pays meat and the biome monster's common materials.
- **Terrarium:** 32 creatures, four per biome, the fourth rare (15% of sightings). Caught species wander in a tank. Each common adds 0.3% health or attack and each rare 0.6% of both, so the full set is about +9.6% health and +7.2% attack.
- **Quests:**
  - **Main story (10 chapters):** the first chapters are the tutorial (hunt, gather, forge, eat). The lore: monsters are acting strangely, a faint glow is found on them, and every trail leads to the peaks and to an elder being the elders call the Hollow Star. The last chapter is "to be continued".
  - **Side quests (10):** one-off goals, open after the Fernwing.
  - **Daily (3) and weekly (1):** drawn from pools by the date, and reset with it.
- **Companion (Pip):** joins when the Emberwing chapter is claimed. Pip does not level up; it gets stronger through its own gear, like the hunter (v0.13.0).
  - **Pip's gear:** a weapon (attack, plus the monster's element or status, like the hunter's) and a vest (care, which scales the support roles), forged from each monster's scales, claws and wings. Starts with a twig and a scarf. Pip's look follows its gear: the fang it carries and its scarf change colour. Pip's gear has no upgrade levels.
  - **Roles,** one per hunt, chosen in prep:

| Role | What Pip does |
|---|---|
| Fighter | a hit every 3s for 20 x Pip's attack, with its element bonus, building its status |
| Healer | once below 40% health, heals 30% x care |
| Trapper | pins the monster in a net at 8s and every 20s after, for 2.5s x care |
| Scout | adds half again x care to the perfect-dodge and perfect-guard windows, shows each hit's ring sooner, and names the coming move |
| Gatherer | one more of each common drop, and 2 x care of the biome's ingredient |
| Resting | stays at camp |

## Decided for later (not built yet)

- **More gear perks for part breaking:** a bigger tap area, or circles that favour one chosen part.
- **Variants and ranks**, once there are more monsters.
- **Ranged weapons** (bow), which need aiming and are a bigger change to the fight.
- **Branching upgrade trees and armor in several pieces**, as in Monster Hunter.
- **A rebirth system** at the end of the ladder. Perks are sized with this in mind.
