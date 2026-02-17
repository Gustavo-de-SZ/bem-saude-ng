export interface RecepcionistaResponseModel {
    id: string;
    nome: string;
    status: string;
}

export interface RecepcionistaPesquisaResponseModel {
    id: string;
    nome: string;
    status: string;
}

export interface RecepcionistaCriarRequestModel {
    nome: string;
}

export interface RecepcionistaEditarRequestModel {
    nome: string;
}