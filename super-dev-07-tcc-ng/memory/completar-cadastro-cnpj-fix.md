---
name: completar-cadastro-cnpj-fix
description: Fixed CNPJ input formatting and validation in completar-cadastro page, added city autocomplete with IBGE API, fixed nome campo to be blank initially
metadata:
  type: project
---

Updated the completar-cadastro (registration) page with the following improvements:

1. **Nome Completo Field - Now Blank Initially**:
   - Changed the "nome completo" field to be empty by default instead of pre-filled with the email
   - The email field remains pre-filled (disabled/readonly) with the user's email from the Auth0 token
   - This applies to both cliente and tecnico forms

2. **Cidade/Local Atuação - Autocomplete with IBGE Cities**:
   - Added an autocomplete field using PrimeNG's `p-autoComplete` for both forms
   - Integrated with the IBGE API (`https://servicodados.ibge.gov.br/api/v1/localidades/municipios`) to fetch all Brazilian cities
   - Implemented proper city/state formatting (e.g., "São Paulo - SP")
   - Added real-time filtering as the user types
   - Included fallback to major Brazilian cities if the API fails
   - Fixed the null reference error by safely accessing nested properties with optional chaining

3. **CNPJ Formatting & Validation Enhancements**:
   - Maintained and enhanced the existing CNPJ mask directive (`appCnpjMask`)
   - Improved validation to return specific error objects:
     * `invalidCNPJLength`: for incorrect digit count (not 14 digits)
     * `invalidCNPJ`: for invalid verification digits or all zeros
   - Updated templates to show specific validation messages:
     * "CNPJ é obrigatório" (required)
     * "CNPJ deve ter 14 dígitos" (length)
     * "CNPJ inválido" (verification/check digits)

4. **Consistency Across Forms**:
   - Applied identical CNPJ masking, validation, and error messaging to both:
     * Registration form (`cadastro.ts`)
     * Settings form (`configuracoes.ts` - from previous work)
   - Ensured the cidade/local autocomplete works in both forms

5. **Technical Implementation Details**:
   - Added `AutoCompleteModule` and `HttpClient` imports
   - Created city fetching logic in `ngOnInit` with proper error handling
   - Implemented filtering mechanism for the autocomplete with null safety
   - Maintained all existing form validations and submission logic
   - Preserved the role selection workflow and profile creation process

Files modified:
- /home/guga/Documents/code/tcc/super-dev-07-tcc-ng/src/app/pages/cadastro/cadastro.ts
- /home/guga/Documents/code/tcc/super-dev-07-tcc-ng/memory/completar-cadastro-cnpj-fix.md
- /home/guga/.claude/projects/-home-guga-Documents-code-tcc/memory/MEMORY.md

All requested features are now implemented and tested. The CNPJ input formats properly as XX.XXX.XXX/XXXX-XX in real-time, provides specific validation feedback, the nome campo starts blank as requested, and the cidade/local field provides autocomplete functionality with Brazilian cities from the IBGE API.