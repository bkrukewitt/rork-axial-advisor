# Admin Panel: Compact Table View + Per-Field Revert

## Files Changed

### `expo/components/PresetTableView.tsx` - [x] Complete
- Compact scrollable table showing ALL presets across ALL crops at once
- Outer vertical ScrollView for rows, inner horizontal ScrollView for columns
- Left column: Crop + Moisture label (color-coded by crop type)
- Data columns: Concave | Rotor | Fan | Top Sieve | Bottom Sieve | Auto Mode
- Alternating row backgrounds, group separators between crops
- Each row tappable → fires `onEdit(preset)` callback

### `expo/components/PresetEditModal.tsx` - [x] Complete
- Bottom-sheet-style Modal for editing a single preset
- Opened when tapping a row in table view
- All fields: Concave, Rotor, Fan, Top Sieve, Bottom Sieve, Automation Mode, Notes
- Per-field revert button (amber) appears when value differs from default
- "Default: X" hint shown beneath changed fields
- Changed fields highlighted in amber

### `expo/app/admin.tsx` - [x] Complete
- Card / Table icon toggle in the Settings tab filter area
- Table mode: renders PresetTableView — full dataset visible at a glance
- Card mode: per-crop card behavior with per-field revert support
- Per-field revert buttons and default value hints in card view
- "Reset All to Defaults" button retained for bulk reset

## Removed
- Supabase web editor banner removed per user request
