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

## Art follow-ups
- The gathering creatures (32 bugs, fish and critters) and ingredient icons are still the small hand-made pixel sprites.
- Art sources live in `art/*.js`; run `python3 tools/build-art.py` after editing them to inline them into `index.html`.

## Earlier ideas still open
- Variants and ranks of existing monsters (deferred until there are more monsters).
- A rebirth system (skills and perks are kept modest for it).
