import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const parseDate = (dateString: string) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const processTasks = async (tasks: any[]) => {
  const processedTasks = tasks.map((task) => ({
    task_id: task["Task ID"]?.toString() || "",
    task_name: task["Task Name"] || "",
    pipe_id: task["Pipe id (short text)"]?.toString() || "",
    status_escala: task["Status escala (drop down)"] || "",
    data_solicitacao_escala:
      parseDate(task["Data solicitação escala (date)"]) || null,
    data_equipe_escalada:
      parseDate(task["Data equipe escalada (date)"]) || null,
    tempo_solucao: task["Tempo solução (formula)"]?.toString() || "",
    subarea_projeto: task["Subárea projeto (drop down)"] || "",
    filial_atendimento: task["Filial de Atendimento (drop down)"] || "",
    assignee: task["Assignee"] || "",
    tamanho_evento: task["Tamanho do Evento (drop down)"] || "",
    produto: task["Produto (A&B) (drop down)"] || "",
    zig_tickets: task["Zig.Tickets (drop down)"]?.toString() || "",
    solucao: task["Solução (A&B) (labels)"] || "",
    qtd_head: parseInt(task["Qtd. head (number)"]) || 0,
    evento_proprio_treinamento:
      task["Evento propício a treinamento? (drop down)"] || "",
    qtd_coordenador: parseInt(task["Qtd. coordenador (number)"]) || 0,
    qtd_cco: parseInt(task["Qtd. C-CCO (number)"]) || 0,
    qtd_supervisor: parseInt(task["Qtd. supervisor (number)"]) || 0,
    qtd_tecnico: parseInt(task["Qtd. técnico (number)"]) || 0,
    equipe_escalada: task["Equipe escalada (list relationship)"] || "",
    orcamento: task["Orçamento? (drop down)"] || "",
    forma_pagamento_equipe:
      task["Forma pagamento equipe técnica (drop down)"] || "",
    valor_pagamento_equipe:
      task["Valor pagamento equipe técnica (text)"]?.toString() || "",
    viagem: task["Viagem (drop down)"] || "",
    data_viagem: task["Data viagem (saída e retorno) (text)"]?.toString() || "",
    hospedagem: task["Hospedagem (drop down)"] || "",
    qtd_cnh: parseInt(task["Qtd. CNH (drop down)"]) || 0,
    tipo_transporte: task["Tipo transporte (drop down)"] || "",
    tipo_alimentacao: task["Tipo alimentação (drop down)"] || "",
    data_retirada_veiculo:
      parseDate(task["Data retirada veiculo (date)"]) || null,
    data_retirada_equipamentos:
      parseDate(task["Data retirada equipamentos no escritório (date)"]) ||
      null,
    data_chegada_evento: parseDate(task["Data chegada evento (date)"]) || null,
    data_inicio_golive: parseDate(task["Data início Go live (date)"]) || null,
    data_termino_golive: parseDate(task["Data término Go live (date)"]) || null,
    data_previsao_retorno:
      parseDate(task["Data previsão retorno equipamentos (date)"]) || null,
    datas_golive:
      task["Datas go live (01/01/2024, 02/01/2024...) (text)"]?.toString() ||
      "",
    endereco_evento: task["Endereço evento (location)"] || "",
    credenciamento: task["Credenciamento (drop down)"] || "",
    data_envio_credenciamento:
      parseDate(task["Data envio credenciamento (date)"]) || null,
    credenciamento_attachment: task["Credenciamento (attachment)"] || "",
    contrato_intermitente: task["Contrato Intermitente (drop down)"] || "",
    informacoes_adicionais:
      task["Informações adicionais para escala (text)"] || "",
    cliente: task["Cliente (organização/produtora) (short text)"] || "",
    chave_ativacao:
      task["Chave ativação/Place ID (short text)"]?.toString() || null,
    cod_evento: task["COD. EVENTO (short text)"]?.toString() || null,
  }));

  return processedTasks;
};
