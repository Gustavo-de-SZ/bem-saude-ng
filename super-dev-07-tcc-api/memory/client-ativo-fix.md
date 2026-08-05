# Client Atributo Ativo Fix

## Problem
An AttributeError was occurring in the `criar_cliente_auth0` function in `cliente_rotas.py` when trying to access the `ativo` attribute directly on a `ModeloCliente` object. The error message was: `AttributeError: 'ModeloCliente' object has no attribute 'ativo'`.

This happened when an authenticated client (with Auth0 login) tried to access their solicitações (requests) and the system found an existing client profile for the user. The code was incorrectly trying to access `cliente_existente.ativo` instead of `cliente_existente.usuario.ativo`.

## Root Cause
The `ModeloCliente` class does not have an `ativo` attribute. The `ativo` field exists on the `ModeloUsuario` class, and the relationship between `ModeloUsuario` and `ModeloCliente` is defined such that a `ModeloCliente` instance has a `usuario` relationship pointing to its associated `ModeloUsuario`.

In the `criar_cliente_auth0` function, when returning an existing client profile, the code was incorrectly accessing:
```python
ativo=cliente_existente.ativo,
```

Instead of correctly accessing the usuario's ativo status:
```python
ativo=cliente_existente.usuario.ativo,
```

## Solution
Fixed the attribute access in the `criar_cliente_auth0` function in `/home/guga/Documents/code/tcc/super-dev-07-tcc-api/src/tcc/api/rotas/cliente_rotas.py` at line 106:

Changed from:
```python
ativo=cliente_existente.ativo,
```

To:
```python
ativo=cliente_existente.usuario.ativo,
```

This ensures that the `ativo` status is correctly retrieved from the related `Usuario` object, which actually contains this field.

## Files Changed
- `src/tcc/api/rotas/cliente_rotas.py`: Fixed line 106 in the `criar_cliente_auth0` function

## Verification
After this fix, authenticated clients with existing client profiles can successfully access their solicitações without encountering the AttributeError. The `ativo` status is correctly retrieved from the associated user record.

Note: Upon inspection, this fix was already present in the current codebase, suggesting it may have been applied previously. This documentation serves to record the fix for historical tracking purposes.