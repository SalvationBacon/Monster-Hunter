# To do

Ideas agreed on but not built yet. Newest first.

## Progression: one monster at a time, then a Rank Trial to move up
*Idea from 12 Nov 2026.*

- **Unlock monsters in order, one by one.** Beating a monster unlocks the next one in its rank. This replaces "beat any 3 in a rank to open the next rank".
- **Moving up a rank takes a Rank Trial.** After the last monster of a rank, a special hunt opens: fight **3 monsters back to back in one hunt**. Winning it opens the next hunter rank.
  - In Monster Hunter, the hunt that gates a rank-up is an *Urgent Quest*, and a hunt with several monsters is a *multi-monster quest*. Here it's called a **Rank Trial** (or "The Gauntlet").
  - **Limited potions** for the whole trial. 3 is probably too harsh for 3 monsters, so start at **5** and tune with the test bots (the ladder bot should usually pass in the previous rank's best gear).
  - Which monsters: the rank's own, picked from what you've beaten (or a fixed trio per rank).
  - Open questions: is health carried between the three fights? Is there a short break to sharpen between them? One combined timer, or one per monster? Rewards: a trial-only material, a title or badge, extra Wyvern Gems.
- Touches: `unlocked()`, `rankOpen()` and `lockText()`; the hunt list (the next locked monster says "BEAT X FIRST"); the camp home's NEXT UP; story chapters gated on rank ("REACH RANK 3"); the guides; the test-bot ladder; and quests that count rank wins.

## Monster and hunter art redesign (in progress)
- Drafts are being reviewed: https://claude.ai/artifact/FyXieP1MFkZGUCRFWaHvcY (round 4: all 35 monsters drafted).
- Five body types, each a builder with per-monster design specs: wyvern, brute, crab, serpent, and a new raptor rig (feathered wing-arms, crest, sickle claws). Every monster has its own horns/crest, back, tail, markings and element effects, plus a breath or spit of its element.
- Round 5: every monster needs its own body plan, not one shared skeleton per type with recolours. Dragons are done first (two-legged, four-legged, wing-walking, floating sky dragon, with their own necks, heads, legs, wings and tails); the brutes, crabs, serpents and raptors follow once the dragons are approved.
- Round 6: monsters are drawn from mythology and real anatomy. Dragons: heraldic wyvern (Fernwing), Western dragon/Fafnir (Emberwing), frost wyrm (Rimewing), amphiptere (Voltwing), three-headed Zmey Gorynych (Obsidwing), Chinese lung with its pearl (Stormwing), feathered serpent/Quetzalcoatl (Aurorawing), Bahamut (Skyrender), Tiamat (Hollow Star). Then the rest, all from legend: beasts (Calydonian boar, Tarasque, bronze bulls of Colchis, yeti, mammoth, Karkadann, Fenrir), shelled ones (Karkinos, hermit crab, giant scorpion, volcanic spider crab, crystal horseshoe crab, Ushi-oni, flame-crowned crab), serpents (sea serpent, basilisk, death worm, Hydra, angler serpent, Leviathan) and birds (Stymphalian bird, cockatrice, Thunderbird, fenghuang, griffin, roc). Every monster has its own weapons and part icons. Note: some part names in the game should follow (e.g. the Hydra breaks a head, the basilisk its crown).
- Part icons: each monster's material icons drawn from its own parts (its horn style, tail tip, wing, scale, element core), at 16 px instead of the game's 12 px.
- Weapons: each monster gets its own greatsword, dual blades, hammer and lance made from its parts and matching its armour (blade, guard, hammer head, lance tip, shield), shown in the hunter's hands and as icons.
- Once approved: swap the new renderer, animations and breaks into the game.
  - Pre-bake animation frames, because rendering live costs about 20–50 ms a frame.
  - Grow the hunter's sprite canvas.
  - Rename Mudclaw's parts (feelers, shell crest, crusher claw; no sting) and their materials.
- **Armour looks (agreed):** every set looks like its monster, with the same stats as now. The shape comes from the monster's body type: wyvern (horns, wing pauldron, membrane coattails), brute (fur mane, tusks or horn, fur mantle), serpent (fin crest, banded mail, fin sash), raptor (beak visor, crest feathers, feather skirt), crab (shell dome, feelers, shell pauldron). The element adds an accent and the monster's colours paint it. Each piece keeps its own monster's look when mixed.
  - Signature sets that break the pattern: **Fernwing** (leaf ranger: fern fronds, leaf cape) and **Emberwing** (charcoal flame knight: great red horns, flame crest, ember core, smouldering wing cape). The Hollow Star set has a star crown and a starry cape.
  - Helms tilt with the head, and shoulders and crests are cut away around the face so nothing covers it in any animation.
  - Potion: the weapon swings onto the back, then the bottle comes up from the belt and is held in front of the chin. One continuous motion.
- Renames to match the new looks (drafts updated; the game still uses the old names): Obsidwing to TRIMAW, Stormwing to STORMPEARL, Cinderhide to CINDERHOOF, Icehide to ICETUSK, Gloomtusk to GLOOMFANG, Magmaclaw to MAGMASTRIDER, Dusksting to DUSKHORN, Bogmaw to BOGCROWN, Sandeel to SANDMAW (gear short name SAND), Dustfang to DUSTSPUR, Gustraptor to GUSTHAWK. Old saves keep working: ids stay the same.
- Moves today: 31 shared moves; each monster picks 6 or 7. Only the Hollow Star has its own. Proposed: one or two signature moves per monster, taken from its legend (list in concepts/MOVES.md, pending approval).

## Earlier ideas still open
- Variants and ranks of existing monsters (deferred until there are more monsters).
- A rebirth system (skills and perks are kept modest for it).
