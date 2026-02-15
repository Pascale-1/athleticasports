

# Review and Feminize All App Wording (FR and EN)

## Context
Athletica is a women-only sports community. The French language has grammatical gender, and many strings currently use masculine forms. English is mostly gender-neutral but a few terms like "players" should be updated to feel more inclusive for the target audience.

## Changes Overview

### French (`fr`) -- Grammatical Gender Fixes

These are the strings that use masculine adjectives/past participles when they should use feminine forms, since all users are women.

#### `src/i18n/locales/fr/common.json`
| Key | Current (masculine) | New (feminine) |
|-----|-------------------|----------------|
| `status.active` | Actif | Active |
| `status.inactive` | Inactif | Inactive |
| `status.confirmed` | Confirme | Confirmee |
| `status.cancelled` | Annule | Annulee |
| `status.completed` | Termine | Terminee |
| `status.going` | Inscrit | Inscrite |
| `status.full` | Complet | Complet (OK -- refers to event) |
| `status.available` | Ouvert | Ouvert (OK -- refers to event) |
| `home.readyToPlay` | Prete a trouver... | Prete a trouver... |
| `home.open` | Ouvert | Ouvert (OK -- refers to status) |
| `invitations.invited` | Invite | Invitee |
| `invitations.cancelDescription` | Etes-vous sur... | Etes-vous sure... |
| `quickActions.findPartners` | Trouver joueurs | Trouver joueuses |
| `accountDeletion.dangerZoneDesc` | Soyez certain(e) | Soyez certaine |
| `accountDeletion.successDesc` | ...supprimes | ...supprimes (OK -- refers to data) |
| `auth.welcomeBack` (auth.json) | Content de vous revoir | Contente de vous revoir |
| `auth.teamInvitationDesc` | Vous avez ete invite... | Vous avez ete invitee... |

#### `src/i18n/locales/fr/events.json`
| Key | Current | New |
|-----|---------|-----|
| `rsvp.committed` | Engage | Engagee |
| `rsvp.committedToMatch` | Engage pour cette partie | Engagee pour cette partie |
| `rsvp.count` | {{count}} inscrit | {{count}} inscrite |
| `rsvp.count_one` | {{count}} inscrit | {{count}} inscrite |
| `rsvp.count_other` | {{count}} inscrites | {{count}} inscrites (OK) |
| `attendees.committed` | Engage | Engagee |
| `attendees.noResponses` | Soyez le premier... | Soyez la premiere... |
| `attendees.count` | {{count}} inscrit | {{count}} inscrite |
| `attendees.count_one` | {{count}} inscrit | {{count}} inscrite |
| `form.rsvpDeadlineDesc` | les joueurs ne pourront... | les joueuses ne pourront... |
| `form.game.players` | Joueurs | Joueuses |
| `form.game.pickupGameDescription` | ...trouver des joueurs | ...trouver des joueuses |
| `details.organizer` | Organisateur | Organisatrice |
| `lookingForPlayers.joined` | inscrits | inscrites |
| `lookingForPlayers.includingYou` | (vous inclus) | (vous incluse) |

#### `src/i18n/locales/fr/matching.json`
| Key | Current | New |
|-----|---------|-----|
| `findGame.noResults` | Aucun joueur disponible | Aucune joueuse disponible |
| `browseGamesDesc` | ...cherchent des joueurs | ...cherchent des joueuses |
| `proposal.matchedWithGame` | Tu as ete matchee... | Tu as ete matchee... |
| `proposal.notInterested` | Pas interessee | Pas interessee |
| `proposal.committedDesc` | Tu es inscrite... | Tu es inscrite... |
| `readyToPlay` | Prete a jouer ? | Prete a jouer ? |
| `toggleDesc` | Active pour etre matchee | Active pour etre matchee |
| `alreadyInterested` | Tu es deja interessee | Tu es deja interessee |
| `labels.joined` | Inscrit | Inscrite |
| `joinedSuccess` | Tu es inscrit... | Tu es inscrite... |

#### `src/i18n/locales/fr/teams.json`
| Key | Current | New |
|-----|---------|-----|
| `danger.confirmDelete` | Etes-vous absolument sur ? | Etes-vous absolument sure ? |
| `actions.leaveConfirm` | Etes-vous sur... | Etes-vous sure... |
| `actions.deleteConfirm` | Etes-vous sur... | Etes-vous sure... |
| `invite.emailPlaceholder` | joueur@exemple.com | joueuse@exemple.com |
| `generateTeams.playersAvailable` | {{count}} joueurs disponibles | {{count}} joueuses disponibles |
| `generateTeams.playersEach` | ~{{count}} joueurs chacune | ~{{count}} joueuses chacune |
| `access.publicTeamPreview` | ...ouverte a tous | ...ouverte a toutes |

#### `src/i18n/locales/fr/auth.json`
| Key | Current | New |
|-----|---------|-----|
| `welcomeBack` | Content de vous revoir ! | Contente de vous revoir ! |
| `teamInvitationDesc` | ...ete invite a... | ...ete invitee a... |

### English (`en`) -- Inclusive Language for Women

English is mostly gender-neutral, but a few terms can be updated to better reflect the women-only community.

#### `src/i18n/locales/en/common.json`
| Key | Current | New |
|-----|---------|-----|
| `quickActions.findPartners` | Find Partners | Find Players |
| `home.noActivitiesDesc` | ...following athletes... | ...following players... (or keep athletes) |

#### `src/i18n/locales/en/events.json`
| Key | Current | New |
|-----|---------|-----|
| `form.rsvpDeadlineDesc` | ...players can no longer... | OK (gender-neutral) |
| `form.game.pickupGameDescription` | ...find players | ...find players (OK) |
| `lookingForPlayers.joined` | players joined | players joined (OK) |

#### `src/i18n/locales/en/onboarding.json`
| Key | Current | New |
|-----|---------|-----|
| `goal.play.description` | Find games and players near me | Find games and players near me (OK -- gender-neutral) |

#### `src/i18n/locales/en/matching.json`
| Key | Current | New |
|-----|---------|-----|
| `findGame.noResults` | No players available | No players available (OK) |
| `browseGamesDesc` | ...looking for players... | ...looking for players (OK) |

### Summary

The vast majority of changes are in French, where grammatical gender matters:
- **~30+ French strings** need feminine agreement (adjectives, past participles, nouns)
- **~2-3 English strings** can be refined for consistency

All 8 translation files will be touched:
1. `src/i18n/locales/fr/common.json`
2. `src/i18n/locales/fr/auth.json`
3. `src/i18n/locales/fr/events.json`
4. `src/i18n/locales/fr/matching.json`
5. `src/i18n/locales/fr/teams.json`
6. `src/i18n/locales/en/common.json`
7. `src/i18n/locales/en/onboarding.json` (minimal -- already good)
8. `src/i18n/locales/en/matching.json` (minimal -- already good)

No code logic changes are needed -- only JSON translation values.

