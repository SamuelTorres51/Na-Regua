import type {
  Agendamento,
  Profissional,
  Servico,
} from "@/features/agenda/types";

// PROVISÓRIO: trocar pelas chamadas reais da API quando as rotas de agenda,
// profissionais e serviços estiverem disponíveis.

export function listarAgendamentos(): Promise<Agendamento[]> {
  return Promise.resolve<Agendamento[]>([]);
}

export function listarProfissionais(): Promise<Profissional[]> {
  return Promise.resolve<Profissional[]>([]);
}

export function listarServicos(): Promise<Servico[]> {
  return Promise.resolve<Servico[]>([]);
}
