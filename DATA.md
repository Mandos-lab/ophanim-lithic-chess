# Ophanim sphere data (Step 1)

Four standalone data files, one per sphere, plus `manifest.json`. Every number in them is computed by script
(`tools/build_data.py`) from the letter values. Nothing is typed in by hand.

| File | Words | Rule |
|---|---|---|
| `data/greek.json` | 98 | Greek isopsephy, 27 letters (stigma 6, koppa 90, sampi 900). Accents ignored. |
| `data/hebrew.json` | 95 | Gematria, finals count the plain value. `value_sofit500` counts finals as 500 to 900. |
| `data/futhark.json` | 61 | HOUSE RULE: runes were not numerals. Elder Futhark, Kylver order, Fehu 1 to Othala 24 (Dagaz 23, Othala 24). |
| `data/armenian.json` | 38 | Armenian numerals 1 to 9000, plus Օ 10000 and Ֆ 20000 (as on the site calculator). |

## Each word

`id`, `script`, `text`, `lang`, `transliteration`, `translation_en` (Armenian also `translation_el`), `group`, `letters`,
`value`, `mod36` (node 1 to 36, 36 shown instead of 0), `node_degrees` (node x 10), `bearing_360` (total mod 360, 360 shown instead of 0),
`sector` and `sector_count` and `sector_letter`, `tone_sequence` (the letter values in order), `hz_low`, `hz_high`
(432 Hz scale pitches), `peers_same_sphere`, `peers_other_spheres` (same plain value; a coincidence of number, not a link of meaning),
`lemma` and `references` (empty for now: Step 2 and 3).
Hebrew adds `value_sofit500`. Futhark adds `rune_names`.

## Checks (in `manifest.json`)

Greek 27 letters = 4,995. Hebrew 22 letters = 1,495; with finals at 500 to 900 = 4,995. Futhark = 300, and by aett 36, 100, 164.
Armenian 36 letters = 49,995.
`tools/verify_js.js` runs the page calculators in a browser and compares all 292 words with these files: 0 mismatches.
Sector edges use exact integer arithmetic.

## Rebuild

1. `node tools/dump_words.js <folder with gr-words.js he-words.js fu-words.js hy-words.js> words.json`
2. `python3 tools/build_data.py words.json data/`

## Next

Step 2: Bible and literature references for each word, each citation checked.
Step 3: Strong's and BDB (public domain) as the root baseline for Greek and Hebrew; other lexicons only after their licence is checked.
