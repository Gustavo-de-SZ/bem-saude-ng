export interface Servico {
  icone: string;
  categoria: 'Redes' | 'Hardware' | 'Software' | 'Segurança' | 'Impressoras' | 'Outros';
  titulo: string;
  status: 'Finalizado' | 'Pendente';
  cliente: string;
  data: string;
  duracao: string;
  valor: string;
  descricao: string;
  // ID do equipamento vinculado a este serviço (opcional)
  equipamentoId?: string;
}