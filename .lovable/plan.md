

# Harmonize Event Creation Form & Remove Hidden Fields

## Problem
The current "More options" collapsible hides 5 important fields (Description, Participant Limit, Recurrence, RSVP Deadline, Looking for Players). Users may never discover these features, leading to incomplete events. The form also lacks visual consistency -- some sections have card wrappers, others don't, and label sizes vary between `text-xs`, `text-[10px]`, and `text-[11px]`.

## Design Approach
Instead of hiding fields behind a collapsible, show all fields inline but keep them **lightweight and compact** so the form doesn't feel longer. The trick is to use inline controls (switches, small inputs on the same row as labels) rather than stacked full-width fields.

## Changes

### 1. Remove the "More options" collapsible entirely
All fields become visible. To compensate for the added vertical space, each optional field uses an **inline row layout** (label + control on the same line) instead of stacked label-then-input.

### 2. Redesign optional fields as compact inline rows
Each optional field becomes a single horizontal row (~36px tall):

- **Description**: A small "Add note..." text button that expands a textarea only when tapped (not a collapsible -- just a conditional render with a simple toggle)
- **Participants**: Inline row: icon + "Max participants" label + small number input (w-20) on the right
- **Recurrence**: Inline row: icon + "Repeat" label + select dropdown (w-32) on the right
- **RSVP Deadline**: Inline row: icon + "RSVP cutoff" label + switch on the right, with preset pills appearing below only when enabled
- **Looking for Players**: Stays as-is (already an inline switch row), but moved out of a card wrapper into a simple row

### 3. Unify label sizing
Standardize all labels to `text-xs` (12px). Remove the inconsistent `text-[10px]` and `text-[11px]` variants. Sub-labels/hints use `text-[10px] text-muted-foreground`.

### 4. Add thin visual separators between sections
Use `<Separator />` components between the 3 logical groups:
- Essentials (Type, Sport/Team, Title, When, Where, Visibility)
- Match Details (opponent card, match-only)
- Options (Description, Participants, Recurrence, RSVP, LFP)

### 5. Description field: "Add note" pattern
Instead of always showing a textarea, show a ghost button "Add a note..." that, when clicked, reveals the textarea. This is a common mobile pattern (like adding a note in calendar apps) that saves space without hiding behind a generic "More options" label.

## Technical Details

### File: `src/components/events/UnifiedEventForm.tsx`

**Remove Collapsible wrapper** (lines 682-875): Replace the entire `<Collapsible>` block with inline fields rendered directly in the form flow.

**New inline layout for optional fields:**
```tsx
{/* Separator */}
<Separator className="my-1" />

{/* Description - tap to expand */}
{!showDescription ? (
  <Button type="button" variant="ghost" onClick={() => setShowDescription(true)}
    className="w-full justify-start h-8 text-xs text-muted-foreground px-0">
    + Add a note...
  </Button>
) : (
  <FormField name="description" render={({ field }) => (
    <FormItem>
      <FormControl>
        <Textarea {...field} placeholder="Add details..." 
          className="min-h-[48px] resize-none text-xs" autoFocus />
      </FormControl>
    </FormItem>
  )} />
)}

{/* Participants - inline row */}
<div className="flex items-center justify-between h-9">
  <Label className="text-xs flex items-center gap-1.5">
    <Users className="h-3.5 w-3.5" /> Max participants
  </Label>
  <Input name="maxParticipants" type="number" className="w-20 h-8 text-xs text-right" placeholder="--" />
</div>

{/* Recurrence - inline row */}
<div className="flex items-center justify-between h-9">
  <Label className="text-xs flex items-center gap-1.5">
    <Repeat className="h-3.5 w-3.5" /> Repeat
  </Label>
  <Select value={recurrenceType} onValueChange={...}>
    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
    ...
  </Select>
</div>

{/* RSVP Deadline - inline switch, presets expand below */}
<div className="space-y-2">
  <div className="flex items-center justify-between h-9">
    <Label className="text-xs flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5" /> RSVP cutoff
    </Label>
    <Switch checked={showRsvpDeadline} onCheckedChange={setShowRsvpDeadline} />
  </div>
  {showRsvpDeadline && (
    <div className="flex flex-wrap gap-1.5">
      {/* deadline preset pills */}
    </div>
  )}
</div>

{/* Looking for Players - inline switch (match/training only) */}
{showLookingForPlayersSection && (
  <div className="space-y-2">
    <div className="flex items-center justify-between h-9">
      <Label className="text-xs flex items-center gap-1.5">
        <UserPlus className="h-3.5 w-3.5" /> Looking for players
      </Label>
      <Switch checked={lookingForPlayers} onCheckedChange={setLookingForPlayers} />
    </div>
    {lookingForPlayers && (
      <Select value={playersNeeded} onValueChange={setPlayersNeeded}>...</Select>
    )}
  </div>
)}
```

**Remove card wrapper from LFP section**: The `p-3 bg-primary/5 rounded-lg border border-primary/20` wrapper is removed. LFP becomes a simple inline row like the others.

**Add `showDescription` state**: New `useState(false)` to toggle the description textarea visibility via the "Add a note..." button.

**Standardize labels**: Find-and-replace `text-[10px]` on all `FormLabel` and `Label` components within the form to `text-xs`. Keep `text-[10px]` only for hint text below inputs.

**Add Separator import and usage**: Import from `@/components/ui/separator` and place between the essentials section and options section.

### Impact
- All features are discoverable without any hidden sections
- Form height stays similar because inline rows (~36px each) replace stacked fields (~60px each)
- Consistent visual rhythm with uniform label sizes and row heights
- No more "shame" of users missing important options

