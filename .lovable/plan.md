
# Fix Remaining Masculine Forms in French Translations

## Issue
Several French strings were missed in the previous feminization pass and still use masculine forms.

## Strings to Fix

### `src/i18n/locales/fr/common.json`
| Line | Current | Fixed |
|------|---------|-------|
| 96 | "Prêt à trouver ta prochaine partie ?" | "Prête à trouver ta prochaine partie ?" |

### `src/i18n/locales/fr/matching.json`
| Line | Current | Fixed |
|------|---------|-------|
| 59 | "Pas intéressé" | "Pas intéressée" |
| 61 | "Tu es inscrit à cette partie" | "Tu es inscrite à cette partie" |
| 100 | "Tu es déjà intéressé" | "Tu es déjà intéressée" |
| 107 | "Actif" | "Active" |
| 110 | "Prêt à jouer ?" | "Prête à jouer ?" |
| 111 | "Active pour être matché" | "Active pour être matchée" |

### `src/i18n/locales/fr/events.json`
| Line | Current | Fixed |
|------|---------|-------|
| 105 | "inscrits" (countWithMax) | "inscrites" |
| 108 | "inscrits" (stats) | "inscrites" |
| 113 | "Participants" (attendees title) | "Participantes" |
| 114 | "Inscrits" (attendees going) | "Inscrites" |

## Summary
- 1 fix in `common.json`
- 6 fixes in `matching.json`
- 4 fixes in `events.json`
- No code logic changes -- JSON values only
