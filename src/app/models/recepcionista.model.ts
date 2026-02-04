export interface RecepcionistaResponseModel {
    id: string;
    nome: string;
    status: boolean;
}

export interface RecepcionistaPesquisaResponseModel {
    id: string;
    nome: string;
    status: boolean;
}

export interface RecepcionistaCriarRequestModel {
    nome: string;
}

export interface RecepcionistaEditarRequestModel {
    nome: string;
}