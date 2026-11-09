import { formatPriceInput, parsePrice } from "@/utils/currency";
import type { Servico, ServicoInput } from "./types";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 500;
const INTEGER_PATTERN = /^\d+$/;

export const validationMessages = {
  descricao: `A descrição pode ter até ${MAX_DESCRIPTION_LENGTH} caracteres.`,
  duracao: "Informe a duração em minutos (ex.: 45).",
  nome: `O nome precisa ter entre ${MIN_NAME_LENGTH} e ${MAX_NAME_LENGTH} caracteres.`,
  preco: "Informe um preço válido (ex.: 35,00).",
} as const;

export interface ServiceFormValues {
  ativo: boolean;
  descricao: string;
  duracao: string;
  nome: string;
  preco: string;
}

export type ServiceFormErrors = Partial<
  Record<Exclude<keyof ServiceFormValues, "ativo">, string>
>;

export function toServiceFormValues(
  servico: Servico | null
): ServiceFormValues {
  if (!servico) {
    return { ativo: true, descricao: "", duracao: "", nome: "", preco: "" };
  }

  return {
    ativo: servico.ativo,
    descricao: servico.descricao,
    duracao: String(servico.duracaoMinutos),
    nome: servico.nome,
    preco: formatPriceInput(servico.preco),
  };
}

export function parseServiceForm(values: ServiceFormValues) {
  const nome = values.nome.trim();
  const descricao = values.descricao.trim();
  const duracao = values.duracao.trim();
  const duracaoMinutos = Number(duracao);
  const preco = parsePrice(values.preco);
  const errors: ServiceFormErrors = {};

  if (nome.length < MIN_NAME_LENGTH || nome.length > MAX_NAME_LENGTH) {
    errors.nome = validationMessages.nome;
  }

  if (descricao.length > MAX_DESCRIPTION_LENGTH) {
    errors.descricao = validationMessages.descricao;
  }

  if (!INTEGER_PATTERN.test(duracao) || duracaoMinutos <= 0) {
    errors.duracao = validationMessages.duracao;
  }

  if (preco === null) {
    errors.preco = validationMessages.preco;
  }

  if (preco === null || Object.keys(errors).length > 0) {
    return { errors, input: null };
  }

  const input: ServicoInput = {
    ativo: values.ativo,
    descricao,
    duracaoMinutos,
    nome,
    preco,
  };

  return { errors, input };
}
