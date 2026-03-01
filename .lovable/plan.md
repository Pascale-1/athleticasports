

# Update Your Username

This is a one-time database update, not a code change. The username "pascale" is available (no one else has it).

## What will be done

Run a single SQL update on the `profiles` table:

```sql
UPDATE profiles SET username = 'pascale' WHERE user_id = '245bc703-b8eb-408f-a816-50173ad9ae5e';
```

This changes your username from `pascale_` to `pascale`. No code or feature changes are needed.

