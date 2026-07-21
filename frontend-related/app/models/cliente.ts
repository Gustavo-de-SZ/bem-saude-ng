export interface Cliente {
  nome: string;
  nome_completo?: string;
  empresa: string;
  avaliacao: number;
  email: string;
  telefone: string;
  local: string;
  servicosAtivos: number;
  servicosConcluidos: number;
  tipoCliente: string | null;
  status: string | null;
}