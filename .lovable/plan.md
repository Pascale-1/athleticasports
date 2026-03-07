

## Fix: "Complete Your Profile" Page Flashing on Navigation

### Root Cause

In `src/pages/Index.tsx`, there's a race condition between auth resolution and profile fetching:

1. `useAuth()` briefly returns `user=null` while the session loads
2. The Index useEffect (line 84-86) runs with `user=null` → sets `loading=false`
3. Then auth resolves with a real user → `fetchProfile` starts
4. But `loading` was already set to `false`, so lines 166-181 render the "Complete Your Profile" fallback card while the profile is being fetched
5. Profile arrives → page re-renders correctly as the home dashboard

### Fix (1 file)

**`src/pages/Index.tsx`**

1. Use the `loading` state from `useAuth()`:
   ```tsx
   const { user, loading: authLoading } = useAuth();
   ```

2. Include `authLoading` in the loading check (line 156):
   ```tsx
   if (loading || authLoading) {
     return <PageContainer>...</PageContainer>;
   }
   ```

3. Change the `!profile` fallback (lines 166-181) from the "Complete Your Profile" card to a simple loading spinner. If ProtectedRoute already verified the user has a profile, this state only appears transiently during data fetching — it should never show a "complete profile" CTA. Replace with:
   ```tsx
   if (!profile) {
     return (
       <PageContainer>
         <div className="flex items-center justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </PageContainer>
     );
   }
   ```

This eliminates the flash by ensuring nothing renders until both auth AND profile data are resolved.

