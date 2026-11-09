export interface Servico {
  ativo: boolean;
  descricao: string;
  duracaoMinutos: number;
  id: number;
  nome: string;
  preco: number;
}

export type ServicoInput = Omit<Servico, "id">;
