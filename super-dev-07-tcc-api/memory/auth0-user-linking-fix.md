# Auth0 User Linking Fix

## Problem
Users who existed in the system before Auth0 integration (or who were created through other means) were unable to authenticate via Auth0 after their accounts were linked. The system would correctly find the user by email during the first Auth0 login and update their `auth0_id` field, but if the user already had a client profile, the function would return early without committing the `auth0_id` update to the database. On subsequent login attempts, the system couldn't find the user by their `auth0_id` and returned the error "Acesso negado: Perfil não cadastrado no sistema."

## Root Cause
In the `criar_cliente_auth0` function in `src/tcc/api/rotas/cliente_rotas.py`, when an existing user was found by email and their `auth0_id` needed to be updated, the code would modify the `usuario.auth0_id` field but not commit the change to the database if the user already had a client profile (causing an early return).

## Solution
Added an explicit `session.commit()` call immediately after updating the `usuario.auth0_id` field when linking an existing user via email. This ensures the `auth0_id` update is persisted to the database even if the function returns early due to an existing client profile.

## Files Changed
- `src/tcc/api/rotas/cliente_rotas.py`: Added `session.commit()` after `usuario.auth0_id = auth0_id` in the email matching logic (around line 70)

## Verification
After this fix:
1. Users linking existing accounts to Auth0 will have their `auth0_id` properly saved
2. Subsequent Auth0 logins will successfully find the user by `auth0_id`
3. Clients will be able to access protected endpoints like `/solicitacoes` and `/favoritos` without encountering the "Perfil não cadastrado no sistema" error