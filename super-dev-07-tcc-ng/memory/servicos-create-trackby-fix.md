---
name: servicos-create-trackby-fix
description: Fixed NG0955 error in servicos-create component by implementing proper trackBy function for equipment list
metadata:
  type: bugfix
---

## Problem
The servicos-create component was throwing Angular error NG0955: "The provided track expression resulted in duplicated keys for a given collection." Specifically, it showed duplicated keys being empty strings ("") at indices 0 and 1 in the equipment dropdown list.

## Root Cause
In the servicos-create.component.ts template, the equipment dropdown was using:
```html
@for (eqp of equipamentosDoCliente; track eqp.id) {
```

When the `equipamentosDoCliente` array contained equipment items with null, undefined, or empty string IDs, the `track eqp.id` expression would evaluate to the same value (empty string) for multiple items, causing Angular to detect duplicate keys.

## Solution
Implemented a proper trackBy function that ensures uniqueness:
1. Added a `trackByEquipamento(index: number, item: Equipamento)` method to the component
2. Changed the template to use: `track trackByEquipamento($index, eqp)`
3. The trackBy function returns the item's ID if available, otherwise falls back to the item's index to guarantee uniqueness

## Changes Made
**File:** `src/app/pages/servicos-tecnico/components/servicos-create.ts`

1. **Template update** (line 145):
   ```diff
   - @for (eqp of equipamentosDoCliente; track eqp.id) {
   + @for (eqp of equipamentosDoCliente; track trackByEquipamento($index, eqp)) {
   ```

2. **Added trackBy method** (lines 1007-1016):
   ```typescript
   /**
    * Track function for equipment items to handle cases where id might be empty/null
    * @param index The index of the item
    * @param item The equipment item
    * @returns A unique identifier for tracking
    */
   trackByEquipamento(index: number, item: Equipamento): any {
     // Prefer id if available, otherwise use index to ensure uniqueness
     return item.id || index;
   }
   ```

## Why This Fix Works
- When equipment items have valid IDs, they're used for tracking (optimal performance)
- When equipment items lack IDs (null/undefined/empty), the array index is used instead
- Array indices are always unique within the same array, preventing duplicate keys
- This follows Angular best practices for handling lists where items might not have stable IDs

## Files Modified
- `src/app/pages/servicos-tecnico/components/servicos-create.ts`: 
  - Updated equipment dropdown track expression (line 145)
  - Added trackByEquipamento method (lines 1007-1016)

## Related Context
This fix resolves the NG0955 error that was occurring when loading equipment lists for clients, particularly when equipment items were temporarily lacking IDs during asynchronous loading or when dealing with equipment that hadn't been persisted to the database yet.