# Client Schema Fix

## Problem
The application was experiencing the error "Cliente não possui perfil de cliente" (Client does not have a client profile) when authenticated clients tried to access their solicitações (requests) endpoints, even though the user records had the correct `tipo_perfil = CLIENTE` in the database.

## Root Cause
The `usuario_id` column was missing from the `clientes` table in the database schema, similar to an issue that had previously been fixed for the `servicos` and `agendamentos` tables.

In the `_ensure_database_schema()` function in `src/tcc/api/app.py`, the code was ensuring the `usuario_id` column existed with proper constraints for:
- servicos table
- agendamentos table
- equipamentos table

However, it was missing the `clientes` table from this initialization loop. While there was subsequent code to make the `usuario_id` column nullable in the clientes table (to support manual clients created by technicians), this code only ran if the column already existed - it didn't create the column if it was missing.

This caused the SQLAlchemy model relationship between `ModeloUsuario` and `ModeloCliente` to fail when trying to join on the missing `usuario_id` column, resulting in `usuario.cliente` being `None` even when the user had the correct perfil type.

## Solution
Updated the `_ensure_database_schema()` function to include the `clientes` table in the initial loop that ensures the `usuario_id` column exists with proper foreign key constraints.

The fix ensures that:
1. The `usuario_id` column exists in the `clientes` table (if missing)
2. The column has the proper foreign key constraint referencing `usuarios(id)`
3. The column can be NULL (to support manual clients created by technicians without user accounts)

## Files Changed
- `src/tcc/api/app.py`: Modified `_ensure_database_schema()` function (lines 61-74)

## Verification
After applying this fix, clients who authenticate via Auth0 and have `tipo_perfil = CLIENTE` will now properly load their associated `cliente` record when accessing protected endpoints.