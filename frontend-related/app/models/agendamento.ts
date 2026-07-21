export interface Agendamento {
  id?: string;
  mes?: string;
  dia: string;
  hora: string;
  titulo?: string;
  empresa?: string;
  servico?: string;
  cliente?: string;
  status: StatusAgendamento;
  duracao?: string;
  tipo?: TipoAgendamento;
}

export type StatusAgendamento =
  | 'Confirmado'
  | 'Pendente'
  | 'Concluído'
  | 'Cancelado';

export type TipoAgendamento = 'Presencial' | 'Remoto';