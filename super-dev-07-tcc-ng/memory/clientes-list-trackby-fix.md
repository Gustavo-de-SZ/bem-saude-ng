---
name: clientes-list-trackby-fix
description: Fixed NG0955 error in clientes-tecnico-list component by implementing proper trackBy function
metadata:
  type: bugfix
---

## Problem
The clientes-tecnico-list component was throwing Angular error NG0955: "The provided track expression resulted in duplicated keys for a given collection." Specifically, it showed duplicated keys being empty strings ("") at indices 0 and 1 in the client list.

## Root Cause
In the clientes-tecnico-list.component.ts template, the client list was using:
```html
@for (cliente of clientes; track cliente.email) {
```

When the `clientes` array contained client items with null, undefined, or empty string emails, the `track cliente.email` expression would evaluate to the same value (empty string) for multiple items, causing Angular to detect duplicate keys.

## Solution
Implemented a proper trackBy function that ensures uniqueness:
1. Added a `trackByCliente(index: number, item: Cliente)` method to the component
2. Changed the template to use: `track trackByCliente($index, cliente)`
3. The trackBy function returns the client's email if available and non-empty, otherwise falls back to the array index to guarantee uniqueness

## Changes Made
**File:** `src/app/pages/clientes-tecnico/components/clientes-tecnico-list.ts`

1. **Template update** (line 12):
   ```diff
   - @for (cliente of clientes; track cliente.email) {
   + @for (cliente of clientes; track trackByCliente($index, cliente)) {
   ```

2. **Added trackByCliente method** (lines 216-223):
   ```typescript
   /**
    * Track function for clientes to handle cases where email might be empty/null
    * @param index The index of the item
    * @param item The cliente item
    * @returns A unique identifier for tracking
    */
   trackByCliente(index: number, item: Cliente): any {
     // Prefer email if available and not empty, otherwise use index to ensure uniqueness
     return item.email && item.email.trim() !== '' ? item.email : index;
   }
   ```

## Why This Fix Works
- When client items have valid emails, they're used for tracking (optimal performance)
- When client items lack valid emails (null/undefined/empty), the array index is used instead
- Array indices are always unique within the same array, preventing duplicate keys
- This follows Angular best practices for handling lists where items might not have stable identifiers

## Files Modified
- `src/app/pages/clientes-tecnico/components/clientes-tecnico-list.ts`:
  - Updated cliente list track expression (line 12)
  - Added trackByCliente method (lines 216-223)

## Related Context
This fix resolves the NG0955 error that was occurring when displaying the client list, particularly when client data was being loaded asynchronously or when dealing with clients that had missing email data.