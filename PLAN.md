# Admin Panel: Compact Table View + Web Editor Guidance

Fix the core visibility pain point — agronomists need to see all presets at once, not scroll through individual cards. Also surface the Supabase web editor as the zero-code bulk editing path for the team.

## Files to Change

### `expo/components/PresetTableView.tsx` (new file)
- Compact scrollable table showing ALL presets across ALL crops at once
- Outer vertical ScrollView for rows, inner horizontal ScrollView for columns
- Left column: Crop + Moisture label (color-coded by crop type)
- Data columns: Concave | Rotor | Fan | Top Sieve | Bottom Sieve | Auto Mode
- Alternating row backgrounds, group separators between crops
- Compact font/tight padding to maximize data density on mobile
- Each row tappable → fires `onEdit(preset)` callback

### `expo/components/PresetEditModal.tsx` (new file)
- Bottom-sheet-style Modal for editing a single preset
- Opened when tapping a row in table view
- All fields: Concave, Rotor, Fan, Top Sieve, Bottom Sieve, Automation Mode, Notes
- Uses existing FieldInput pattern from admin.tsx
- Save and Cancel buttons — calls onUpdate and closes

### `expo/app/admin.tsx` (modify)
- Add Card / Table icon toggle in the Settings tab filter area
- Table mode: renders PresetTableView with all presets, all crops — no crop filter needed, full dataset visible at a glance
- Card mode: keeps existing per-crop card behavior unchanged
- Add a subtle info banner at the top of the admin panel: "Bulk editing? Visit app.supabase.com for a full spreadsheet view" with an ExternalLink icon — the zero-code path that already works today with no additional code