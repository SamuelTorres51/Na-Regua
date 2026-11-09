export interface Profissional {
  ativo: boolean;
  email: string;
  id: number;
  nome: string;
  telefone: string;
}

export interface NovoProfissionalInput {
  email: string;
  nome: string;
  senha: string;
  telefone: string;
}

export type AtualizarProfissionalInput = Pick<
  NovoProfissionalInput,
  "nome" | "telefone"
>;
