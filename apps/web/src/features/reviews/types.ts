export interface Avaliacao {
  agendamentoId: number;
  clienteId: number;
  comentario: string;
  criadaEm: string;
  id: number;
  nota: number;
  profissionalId: number;
}

export interface MediaAvaliacoes {
  mediaNota: number | null;
  profissionalId: number;
  totalAvaliacoes: number;
}
