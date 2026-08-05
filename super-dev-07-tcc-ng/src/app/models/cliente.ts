export interface Cliente {
  id?: number;
  nome: string;
  nome_completo?: string;
  empresa: string;
  avaliacao: number;
  email: string;
  telefone: string;
  local: string;
  endereco?: string;
  servicosAtivos?: number;
  servicosConcluidos?: number;
  servicos_ativos?: number;
  servicos_concluidos?: number;
  tipoCliente: string | null;
  status: string | null;
  ativo?: boolean;
}
