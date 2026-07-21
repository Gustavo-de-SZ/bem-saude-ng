export interface Equipamento {
  id?: string;
  clienteId: string; // Vínculo obrigatório com o cliente
  tipo: 'Notebook' | 'Desktop' | 'Impressora' | 'Servidor' | 'Rede' | 'Outro';
  marca: string;
  modelo: string;
  numeroSerie?: string;
  patrimonio?: string; // Tag de inventário interno, se aplicável
  observacoes?: string;
  dataRegistro?: string;
}