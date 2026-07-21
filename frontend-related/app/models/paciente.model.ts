export interface PacienteResponseModel {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  email: string;
  endereco: string;
  observacoes: string;
  status: boolean; // true for ATIVO, false for INATIVO
}

export interface PacienteCriarRequestModel {
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  email: string;
  data_nascimento: string;
  observacoes: string;
}

export interface PacienteEditarRequestModel {
  nome: string;
  telefone: string;
  endereco: string;
  email: string;
  observacoes: string;
}