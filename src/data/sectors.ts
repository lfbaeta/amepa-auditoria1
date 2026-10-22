import { Sector } from '../types';

export const SECTORS_DATA: Sector[] = [
  {
    id: 'gerais',
    name: 'Requisitos Gerais',
    description: 'Aplicável a todos os setores (higienização, EPIs, lixo, higienização de mãos)',
    icon: 'ShieldAlert',
    questions: [
      { id: '1.1', sectorId: 'gerais', text: 'Pias para higienização das mãos exclusivas, limpas e desimpedidas?' },
      { id: '1.2', sectorId: 'gerais', text: 'Há insumos completos? (Sabonete líquido e papel toalha)' },
      { id: '1.3', sectorId: 'gerais', text: 'Dispensadores de álcool 70% estão abastecidos e dentro da validade?' },
      { id: '1.4', sectorId: 'gerais', text: 'Profissionais aderem à higienização das mãos nos momentos críticos?' },
      { id: '1.5', sectorId: 'gerais', text: 'EPIs recomendados estão disponíveis em quantidade e tamanhos adequados?' },
      { id: '1.6', sectorId: 'gerais', text: 'Os profissionais utilizam os EPIs de forma correta?' },
      { id: '1.7', sectorId: 'gerais', text: 'Adornos estão sendo retirados pela equipe (NR-32)?' },
      { id: '1.8', sectorId: 'gerais', text: 'Lixeiras possuem tampa e acionamento por pedal (sem contato manual)?' },
      { id: '1.9', sectorId: 'gerais', text: 'Sacos de lixo seguem a cor do PGRSS? (Branco: infectante | Preto/Cinza: comum)' },
      { id: '1.10', sectorId: 'gerais', text: 'Coletores de perfurocortantes estão dentro do limite de preenchimento (2/3)?' },
      { id: '1.11', sectorId: 'gerais', text: 'O coletor de perfurocortante está montado corretamente e em suporte próprio?' },
      { id: '1.12', sectorId: 'gerais', text: 'O ambiente, mobiliários e equipamentos apresentam-se visualmente limpos?' }
    ]
  },
  {
    id: 'laboratorio',
    name: 'Laboratório de Análises Clínicas',
    description: 'Rotinas de biosegurança, centrífuga, geladeiras exclusivas e controle de temperatura',
    icon: 'FlaskConical',
    questions: [
      { id: '2.1', sectorId: 'laboratorio', text: 'Existe separação física/fluxo claro entre a área suja (técnica) e limpa?' },
      { id: '2.2', sectorId: 'laboratorio', text: 'As bancadas de coleta são limpas e desinfetadas após cada paciente?' },
      { id: '2.3', sectorId: 'laboratorio', text: 'Profissionais utilizam luvas de procedimento e óculos/máscara na coleta?' },
      { id: '2.4', sectorId: 'laboratorio', text: 'A centrífuga passa por limpeza rotineira? Há POP em caso de derramamento?' },
      { id: '2.5', sectorId: 'laboratorio', text: 'A Cabine de Segurança Biológica (se houver) possui laudo de certificação em dia?' },
      { id: '2.6', sectorId: 'laboratorio', text: 'Geladeiras de amostras/reagentes são exclusivas? (Proibido guardar alimentos)' },
      { id: '2.7', sectorId: 'laboratorio', text: 'Há controle e registro diário de temperatura das geladeiras (máxima e mínima)?' },
      { id: '2.8', sectorId: 'laboratorio', text: 'O descarte de tubos de sangue e culturas segue rigorosamente o PGRSS?' }
    ]
  },
  {
    id: 'cme',
    name: 'CME (Central de Material e Esterilização)',
    description: 'Fluxo unidirecional, expurgo, seladoras, testes de autoclave e armazenamento',
    icon: 'Activity',
    questions: [
      { id: '3.1', sectorId: 'cme', text: 'O fluxo da CME é estritamente unidirecional? (Expurgo → Preparo → Esterilização → Guarda)' },
      { id: '3.2', sectorId: 'cme', text: 'No expurgo, os funcionários usam EPIs pesados (avental impermeável, luvas cano longo, protetor facial)?' },
      { id: '3.3', sectorId: 'cme', text: 'A lavagem manual/automatizada segue os POPs? O detergente enzimático é monitorado (diluição/validade)?' },
      { id: '3.4', sectorId: 'cme', text: 'Na área de preparo, os instrumentais são inspecionados com auxílio de lupa?' },
      { id: '3.5', sectorId: 'cme', text: 'As seladoras estão com a temperatura regulada e testadas quanto à integridade da selagem?' },
      { id: '3.6', sectorId: 'cme', text: 'Os pacotes estão identificados com: data, validade, lote, autoclave e responsável?' },
      { id: '3.7', sectorId: 'cme', text: 'O teste Bowie-Dick é realizado diariamente na primeira carga da autoclave?' },
      { id: '3.8', sectorId: 'cme', text: 'Indicadores químicos (Classe 5 ou 6) são inseridos em todas as cargas/pacotes?' },
      { id: '3.9', sectorId: 'cme', text: 'O indicador biológico é realizado na frequência padronizada e devidamente registrado?' },
      { id: '3.10', sectorId: 'cme', text: 'A área de guarda é restrita, limpa, seca e os armários/prateleiras respeitam o distanciamento do piso/teto/paredes?' }
    ]
  },
  {
    id: 'cca',
    name: 'Centro Cirúrgico Ambulatorial (CCA)',
    description: 'Controle de acesso, vestuário, higienização, climatização e Checklist de Cirurgia Segura',
    icon: 'HeartPulse',
    questions: [
      { id: '4.1', sectorId: 'cca', text: 'O controle de acesso é respeitado? (Uso obrigatório de roupa privativa e gorro)' },
      { id: '4.2', sectorId: 'cca', text: 'Há calçados exclusivos para a área cirúrgica ou restrição de entrada com calçados externos?' },
      { id: '4.3', sectorId: 'cca', text: 'O lavatório de escovação das mãos possui acionamento que dispensa o uso das mãos?' },
      { id: '4.4', sectorId: 'cca', text: 'Há disponibilidade de antissépticos adequados (Degermantes e Alcoólicos) para a equipe cirúrgica?' },
      { id: '4.5', sectorId: 'cca', text: 'As escovas para antissepsia das mãos possuem cerdas macias ou são esponjas secas?' },
      { id: '4.6', sectorId: 'cca', text: 'O sistema de climatização da Sala Operatória (SO) possui manutenção e troca de filtros registradas?' },
      { id: '4.7', sectorId: 'cca', text: 'A limpeza concorrente é realizada rigorosamente entre as cirurgias (foco em superfícies de alto toque)?' },
      { id: '4.8', sectorId: 'cca', text: 'O Checklist de Cirurgia Segura da OMS é aplicado e assinado em prontuário?' }
    ]
  },
  {
    id: 'consultorios',
    name: 'Consultórios e Salas de Procedimento',
    description: 'Equipamentos portáteis, troca de lençóis, técnicas assépticas e frascos abertos',
    icon: 'Stethoscope',
    questions: [
      { id: '5.1', sectorId: 'consultorios', text: 'Há desinfecção de equipamentos portáteis (estetoscópio, termômetro, esfigmo) entre os atendimentos?' },
      { id: '5.2', sectorId: 'consultorios', text: 'A maca de exames é limpa/desinfetada e o lençol de papel é trocado a cada paciente?' },
      { id: '5.3', sectorId: 'consultorios', text: 'Na sala de curativos, as técnicas assépticas são rigorosamente mantidas?' },
      { id: '5.4', sectorId: 'consultorios', text: 'Frascos de soluções abertas (soro, antissépticos) contêm a data de abertura e validade pós-abertura anotadas?' },
      { id: '5.5', sectorId: 'consultorios', text: 'Materiais estéreis utilizados em pequenos procedimentos estão dentro do prazo de validade?' }
    ]
  },
  {
    id: 'endoscopia',
    name: 'Sala de Endoscopia / Colonoscopia',
    description: 'Pré-limpeza, Leak Test, desinfecção de alto nível, secagem de canais e armazenamento vertical',
    icon: 'Search',
    questions: [
      { id: '6.1', sectorId: 'endoscopia', text: 'A pré-limpeza do endoscópio é realizada imediatamente após o término do exame, ainda na sala de procedimentos?' },
      { id: '6.2', sectorId: 'endoscopia', text: 'O teste de vazamento (Leak Test) é realizado antes da imersão em água/detergente?' },
      { id: '6.3', sectorId: 'endoscopia', text: 'A limpeza manual de todos os canais é feita com escovas dedicadas, de tamanho adequado e em bom estado?' },
      { id: '6.4', sectorId: 'endoscopia', text: 'A fita-teste para verificar a concentração do desinfetante de alto nível (Ex: Ácido Peracético, OPA) é usada diariamente?' },
      { id: '6.5', sectorId: 'endoscopia', text: 'O tempo de imersão do equipamento no desinfetante respeita estritamente o fabricante?' },
      { id: '6.6', sectorId: 'endoscopia', text: 'Os canais são totalmente secos com ar comprimido medicinal e álcool 70% antes do armazenamento?' },
      { id: '6.7', sectorId: 'endoscopia', text: 'Os endoscópios são guardados na vertical, sem dobras, em armário limpo e fechado?' }
    ]
  },
  {
    id: 'higiene',
    name: 'Higiene, Limpeza (SHL) e Resíduos',
    description: 'DML, saneantes diluídos e etiquetados, registro ANVISA e abrigo de resíduos trancado',
    icon: 'Trash2',
    questions: [
      { id: '7.1', sectorId: 'higiene', text: 'O DML (Depósito de Material de Limpeza) está limpo, organizado e com os mops/panos secando suspensos?' },
      { id: '7.2', sectorId: 'higiene', text: 'Todos os produtos químicos utilizados possuem registro na ANVISA?' },
      { id: '7.3', sectorId: 'higiene', text: 'Os saneantes diluídos na instituição possuem etiqueta com nome do produto, diluição, data, validade e responsável?' },
      { id: '7.4', sectorId: 'higiene', text: 'O abrigo externo de resíduos é mantido trancado, limpo, livre de vetores e com separação entre as categorias de lixo?' }
    ]
  }
];
