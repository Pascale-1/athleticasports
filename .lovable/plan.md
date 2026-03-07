

## Override Username & Delete Duplicate Profile

### Current State
- **Hotmail account** (`pascale_assi@hotmail.com`, user `245bc703`): username = `lola`
- **Gmail account** (`pascale9a@gmail.com`, user `97d3df92`): username = `pascale`, display_name = `Pascale`

The gmail account has some data: 2 team memberships, 7 event attendances, 4 created events, 21 activity logs.

### Plan

**Step 1: Free the username from the gmail profile**
- Update gmail profile username to a throwaway like `pascale_deleted`

**Step 2: Assign username to hotmail profile**
- Update hotmail profile: `username = 'pascale'`, `display_name = 'Pascale'`

**Step 3: Clean up gmail account data**
- Delete team_members, event_attendance, user_activity_log, events for user `97d3df92`
- Delete the gmail profile row

**Step 4: Delete the gmail auth user**
- Use the admin API via an edge function or direct auth deletion

### Important Note
The gmail account has **4 created events** — deleting this user will orphan those events. I'll reassign them to your hotmail account before deletion so nothing is lost.

### Data operations (via insert tool)
All done as SQL UPDATE/DELETE statements — no schema changes needed.

