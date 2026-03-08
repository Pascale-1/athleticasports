

## Add Event Type Differences to Walkthrough

Update the `events.createButton` walkthrough step description in both EN and FR to explain what each event type offers:

### Files to change

1. **`src/i18n/locales/en/walkthrough.json`** — Update `events.createButton.description`:
   - From: `"Tap + to create a new event: training session, competitive game, or social meetup."`
   - To: `"Tap + to create a new event. Training lets you generate balanced teams. Games let you track scores and results. Hangouts are just for fun — no stats, just good times."`

2. **`src/i18n/locales/fr/walkthrough.json`** — Update `events.createButton.description`:
   - From: `"Appuie sur + pour créer un événement : séance d'entraînement, match compétitif ou sortie sociale."`
   - To: `"Appuie sur + pour créer un événement. L'entraînement te permet de générer des équipes équilibrées. Les matchs te permettent de suivre les scores et résultats. Les sorties, c'est juste pour le plaisir — pas de stats, juste du bon temps."`

No code changes needed — just translation file updates.

