export interface Profissional {
  id?: string;
  nome: string;
  especialidade: string;
  nota: number;
  avaliacoes: number;
  tempoResposta: string;
  local: string;
  status: StatusUsuario;
}

export type StatusUsuario = 'online' | 'offline';