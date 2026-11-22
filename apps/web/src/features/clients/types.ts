export interface Cliente {
  ativo: boolean;
  email: string;
  id: number;
  nome: string;
  telefone: string;
}

export type AtualizarClienteInput = Pick<
  Cliente,
  "email" | "nome" | "telefone"
>;

export interface NovoClienteInput extends AtualizarClienteInput {
  senha: string;
}
