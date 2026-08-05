---
name: client-email-endpoints-added
description: Added missing GET/PUT/DELETE endpoints for client operations by email
metadata:
  type: feature
---

## Problem
The frontend cliente service was making HTTP requests to endpoints that didn't exist in the backend API:
- GET `/api/clientes/email/{email}` - for retrieving client data
- PUT `/api/clientes/email/{email}` - for updating client data  
- DELETE `/api/clientes/email/{email}` - for deleting client data

This caused 404 errors when trying to edit or delete clients.

## Solution
Added three new endpoints to `src/tcc/api/rotas/cliente_rotas.py`:
1. **GET** `/clientes/email/{email}` - Retrieve a client by email address
2. **PUT** `/clientes/email/{email}` - Update a client by email address
3. **DELETE** `/clientes/email/{email}` - Delete a client by email address

## Implementation Details

### GET Endpoint
- Retrieves client by joining ModeloCliente with ModeloUsuario on email
- Returns ClienteResponse with full client data
- Includes authorization checks:
  - Clients can only access their own data
  - Professionals can only access clients they're associated with
  - Returns 404 if client not found
  - Returns 403 for unauthorized access

### PUT Endpoint
- Updates client fields based on provided ClienteUpdateRequest
- Maps DTO fields to entity fields (nome → nome_completo, local → endereco)
- Preserves existing fields not provided in the request
- Includes same authorization checks as GET endpoint
- Returns updated ClienteResponse

### DELETE Endpoint
- Deletes client by removing associated Usuario (triggers cascade delete for Cliente)
- Includes same authorization checks as GET endpoint
- Returns 204 No Content on successful deletion

## Security Features
All endpoints implement robust authorization:
- Uses `require_any_profile(["PROFISSIONAL", "CLIENTE"])` dependency
- Additional role-based checks within each endpoint:
  - CLIENTE users: Can only access their own client record (usuario_id matching)
  - PROFISSIONAL users: Can only access clients they're associated with (via ClienteTecnico relationship)
- Utilizes existing ClienteTecnicoRepository.eh_vinculado() method for association checks

## Files Modified
- `src/tcc/api/rotas/cliente_rotas.py`: Added three new endpoint functions (lines 382-528)

## Related Fixes
This backend enhancement works with the frontend fix in:
- `super-dev-07-tcc-ng/memory/client-edit-fix.md`
  Which improved parameter validation in the cliente-edit component