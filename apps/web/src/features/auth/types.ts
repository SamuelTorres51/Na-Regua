export type PerfilAcesso = "administrador" | "cliente" | "profissional";

export interface Usuario {
  ativo: boolean;
  email: string;
  id: number;
  nome: string;
  perfil: PerfilAcesso;
  telefone: string;
}

export interface AuthSession {
  token: string;
  usuario: Usuario;
}

export type DadosPerfil = Pick<Usuario, "email" | "nome" | "telefone">;

export type AtualizarPerfilInput = Partial<DadosPerfil>;

export interface AlterarSenhaInput {
  novaSenha: string;
  senhaAtual: string;
}
