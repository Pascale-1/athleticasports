
# Fix: Join Team RLS Snapshot Issue

## Root Cause
When `handleJoinTeam` does `.insert().select('id').single()`, PostgREST performs the INSERT then tries to SELECT the returned row. The only SELECT policy on `team_members` uses `is_team_member()`, a STABLE function that queries `team_members` itself. Due to PostgreSQL's STABLE function snapshot behavior, it can't see the row that was just inserted in the same command -- so the SELECT check fails and the entire operation returns an RLS error.

## Fix 1: Add SELECT policy for own memberships (Database Migration)
Add a simple SELECT policy that lets authenticated users see their own `team_members` rows directly, without needing `is_team_member()`:

```sql
CREATE POLICY "Users can view own team memberships"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

This also improves the app generally -- users should always be able to see which teams they belong to.

## Fix 2: Simplify `handleJoinTeam` code (`src/pages/TeamDetail.tsx`)
As a belt-and-suspenders fix, change the join handler to:
1. INSERT into `team_members` without `.select()` (just check for errors)
2. Query the inserted row separately to get the `id`
3. Then INSERT into `team_member_roles`

This avoids the combined INSERT+SELECT command entirely.

```typescript
const handleJoinTeam = async () => {
  if (!teamId || !currentUserId) return;
  try {
    // Step 1: Insert member (no .select() to avoid RLS snapshot issue)
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: currentUserId, status: 'active' });
    if (memberError) throw memberError;

    // Step 2: Fetch the newly created member record
    const { data: memberData, error: fetchError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', currentUserId)
      .single();
    if (fetchError || !memberData) throw fetchError || new Error('Member not found');

    // Step 3: Assign member role
    const { error: roleError } = await supabase
      .from('team_member_roles')
      .insert({ team_member_id: memberData.id, role: 'member' });
    if (roleError) throw roleError;

    toast({ title: t('toast.joinSuccess', { name: team?.name }) });
    window.location.reload();
  } catch (error) {
    toast({ title: t('toast.joinError'), variant: "destructive" });
  }
};
```

## Files Changed

| File | Change |
|------|--------|
| Database migration | Add "Users can view own team memberships" SELECT policy |
| `src/pages/TeamDetail.tsx` | Split insert+select into separate calls in `handleJoinTeam` |
