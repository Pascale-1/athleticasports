

# Add New Sports to the Sports List

**File:** `src/lib/sports.ts`

Add the following sports to the `SPORTS` array, after the existing entries and before `other`:

| ID | EN | FR | Emoji | Priority |
|----|----|----|-------|----------|
| `table-tennis` | Table Tennis | Tennis de table | 🏓 | 13 |
| `pickleball` | Pickleball | Pickleball | 🏓 | 14 |
| `handball` | Handball | Handball | 🤾 | 15 |
| `futsal` | Futsal | Futsal | ⚽ | 16 |
| `cricket` | Cricket | Cricket | 🏏 | 17 |
| `hockey` | Hockey | Hockey | 🏑 | 18 |
| `golf` | Golf | Golf | ⛳ | 19 |
| `climbing` | Climbing | Escalade | 🧗 | 20 |
| `martial-arts` | Martial Arts | Arts martiaux | 🥋 | 21 |
| `yoga` | Yoga | Yoga | 🧘 | 22 |
| `hiking` | Hiking | Randonnée | 🥾 | 23 |

Update `other` priority to `99` (already set). No other files need changes — all components (`TeamFilters`, `SportSelector`, `SportQuickSelector`, event forms) dynamically read from `getActiveSports()` so they'll pick up the new entries automatically.

