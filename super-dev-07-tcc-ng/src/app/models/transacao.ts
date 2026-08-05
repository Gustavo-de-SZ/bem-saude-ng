export interface Transacao {
  titulo: string;
  cliente: string;
  data: string;
  valor: number;
  status: 'Pago' | 'Pendente';
}