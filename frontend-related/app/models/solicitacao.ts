export interface Solicitacao {
  id?: number;
  titulo: string;
  descricao_problema: string;
  categoria_id: number;
  dataCriacao: string;
  // status is set by default in backend (ABERTO) so not needed in create payload
}