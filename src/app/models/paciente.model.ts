export interface PacienteResponseModel {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    status: boolean;
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

export interface PacientePesquisaResponseModel {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    email: string;
    data_nascimento: string;
    observacoes: string;
    status: boolean;
}