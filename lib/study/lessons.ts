export interface Lesson {
  /** Matches the id in partTypeCatalog. */
  partTypeId: string;
  title: string;
  whatItTests: string;
  inTheExam: string;
  steps: string[];
  pitfalls: string[];
  example: { question: string; answer: string; explanation: string };
  /** Where this app's version differs from the real exam, so the training isn't misleading. */
  inThisApp?: string;
}

// Original explanations and examples (not real exam material).
export const LESSONS: Lesson[] = [
  {
    partTypeId: "uoe_part1_multiple_choice_cloze",
    title: "Multiple-choice cloze",
    whatItTests:
      "Vocabulário em contexto: colocações, phrasal verbs, expressões fixas e a diferença sutil de sentido entre palavras parecidas.",
    inTheExam:
      "Um texto com 8 lacunas. Para cada uma, 4 opções (A-D) que costumam ter significado parecido; só uma combina com as palavras ao redor.",
    steps: [
      "Leia o texto inteiro antes de olhar as opções, pra entender o assunto e o tom.",
      "Olhe as palavras logo antes e depois da lacuna: quase sempre a resposta é uma colocação (make a decision, not take a decision).",
      "Teste cada opção dentro da frase, em voz alta na cabeça. Descarte as que soam estranhas, não só as que você não conhece.",
      "Se duas opções parecem certas, pergunte qual combina com a preposição ou o padrão gramatical que vem depois.",
    ],
    pitfalls: [
      "Escolher pela tradução ou pelo sentido geral, ignorando que a palavra não forma colocação com o resto da frase.",
      "Esquecer que a opção precisa caber gramaticalmente (transitiva ou não, qual preposição pede).",
      "Deixar uma lacuna em branco: aqui não há penalidade por chutar.",
    ],
    example: {
      question: "Despite the heavy traffic, she managed to ___ the deadline.  A) hold  B) meet  C) reach  D) catch",
      answer: "B) meet",
      explanation:
        "\"Meet a deadline\" é uma colocação fixa. As outras opções são verbos reais, mas não formam par com \"deadline\". Aqui não adianta traduzir: é preciso conhecer a combinação.",
    },
  },
  {
    partTypeId: "uoe_part2_open_cloze",
    title: "Open cloze",
    whatItTests:
      "Gramática e estrutura: preposições, verbos auxiliares, pronomes, artigos, conectivos, quantificadores e comparativos.",
    inTheExam:
      "Um texto com 8 lacunas e nenhuma opção. Você escreve UMA palavra em cada. A ortografia conta.",
    steps: [
      "Descubra a classe da palavra que falta: preposição? auxiliar? pronome? conectivo?",
      "Quase sempre é uma palavra gramatical (the, of, which, had), raramente uma palavra de conteúdo (um substantivo ou verbo).",
      "Leia a frase antes e depois: um verbo vizinho pode pedir uma preposição (depend ON, look FORWARD to).",
      "Releia com a palavra no lugar. Se a frase ficou gramatical e com sentido, está pronta.",
    ],
    pitfalls: [
      "Escrever duas palavras ou uma contração: a resposta é uma só palavra.",
      "Esquecer o tempo verbal que a frase pede (since com present perfect, when com passado simples).",
      "Ignorar a ortografia: \"allthough\" ou \"wich\" perdem o ponto.",
    ],
    example: {
      question: "She has lived in Madrid ___ she was a child.",
      answer: "since",
      explanation:
        "O present perfect (\"has lived\") com um ponto no tempo (\"she was a child\") pede \"since\". \"For\" exigiria uma duração (for ten years), e \"when\" pediria o passado simples.",
    },
  },
  {
    partTypeId: "uoe_part3_word_formation",
    title: "Word formation",
    whatItTests:
      "Formação de palavras: prefixos, sufixos, mudança de classe gramatical e formas negativas ou plurais.",
    inTheExam:
      "Um texto com 8 lacunas. No fim de cada linha há uma palavra-raiz em maiúsculas, que você transforma pra caber na lacuna.",
    steps: [
      "Descubra primeiro a classe que a lacuna pede: substantivo, adjetivo, advérbio ou verbo?",
      "Depois veja se o sentido exige algo extra: negativo (un-, im-, dis-), plural, ou um sentido de pessoa (-er, -ist).",
      "Monte a palavra a partir da raiz dada, sem trocar por outra raiz.",
      "Confira a ortografia: terminações como -ness, -ity e -tion têm mudanças pequenas e cobradas.",
    ],
    pitfalls: [
      "Acertar a classe mas esquecer que o contexto pede o sentido oposto (un-).",
      "Usar outra palavra da família que você conhece melhor em vez de derivar da raiz dada.",
      "Esquecer o plural quando há \"many\" ou \"several\" antes da lacuna.",
    ],
    example: {
      question: "The committee praised her ___ in handling the crisis. (DECISIVE)",
      answer: "decisiveness",
      explanation:
        "Depois de \"her\" vem um substantivo. A raiz é um adjetivo, então ele vira substantivo com -ness: decisive → decisiveness. \"Decision\" vem de outra raiz (decide), então não serve.",
    },
  },
  {
    partTypeId: "uoe_part4_key_word_transformation",
    title: "Key word transformation",
    whatItTests:
      "Dizer a mesma coisa com outra estrutura: voz passiva, discurso indireto, condicionais, phrasal verbs e expressões fixas.",
    inTheExam:
      "6 frases. Você completa uma segunda frase com o mesmo sentido da primeira, usando a palavra dada SEM alterá-la, em 3 a 6 palavras (contrações contam como duas).",
    steps: [
      "Identifique a estrutura que a palavra-chave pede (passive? phrasal verb? uma expressão como \"no sooner\"?).",
      "Escreva só o que falta na lacuna, sem repetir palavras que já estão na frase.",
      "Mantenha a palavra-chave exatamente como foi dada (mesma forma, mesmo tempo verbal).",
      "Releia a frase completa com sua resposta e confira se o sentido é idêntico ao original.",
    ],
    pitfalls: [
      "Mudar a forma da palavra-chave (seen → see) ou deixá-la de fora.",
      "Passar de 6 palavras, ou escrever só 2: o limite é rígido.",
      "Trocar o sentido sem perceber (always → usually, may → must).",
    ],
    example: {
      question: "I last saw her three years ago.  SEEN  →  I ___ her for three years.",
      answer: "have not seen",
      explanation:
        "\"Last ... ago\" vira present perfect negativo com \"for\": \"I haven't seen her for three years\". A palavra-chave \"seen\" entra sem mudar de forma, e são 3 palavras.",
    },
  },
  {
    partTypeId: "reading_part5_multiple_choice",
    title: "Reading: multiple choice",
    whatItTests:
      "Leitura profunda: detalhes, opinião do autor, tom, propósito e o que está implícito, não só o que está escrito.",
    inTheExam:
      "Um texto longo e 6 perguntas com 4 opções cada. As perguntas seguem a ordem do texto.",
    steps: [
      "Leia a pergunta antes do texto pra saber o que procurar, mas leia as opções só depois de localizar o trecho.",
      "Marque o parágrafo certo e releia com atenção. A resposta quase nunca repete as palavras do texto: é uma paráfrase.",
      "Cuidado com a opção que usa palavras do texto mas diz outra coisa. Isso é o distrator mais comum.",
      "Em perguntas de implicação, ache a pista no que o personagem faz ou no tom, não numa frase que diga o sentimento.",
    ],
    pitfalls: [
      "Escolher a opção que copia palavras do texto: geralmente é a errada.",
      "Responder pelo que você acha, não pelo que o texto sustenta.",
      "Ler o texto todo em detalhe antes das perguntas: perde tempo.",
    ],
    example: {
      question:
        "\"Mara folded the letter slowly, twice, and put it in a drawer she never opened.\" What does this suggest about her feelings?  A) She is relieved.  B) She is trying to avoid thinking about it.  C) She is excited to reply.  D) She has forgotten about it.",
      answer: "B) She is trying to avoid thinking about it.",
      explanation:
        "Nenhuma emoção é dita; a pista são as ações: dobrar devagar e guardar numa gaveta \"que nunca abre\" indicam evitar o assunto. É inferência, não leitura literal.",
    },
  },
  {
    partTypeId: "reading_part6_cross_text_matching",
    title: "Reading: cross-text matching",
    whatItTests:
      "Comparar opiniões de textos diferentes sobre o mesmo tema: onde os autores concordam, discordam ou se complementam.",
    inTheExam:
      "Quatro textos curtos de autores diferentes sobre o mesmo assunto. As perguntas pedem comparação entre eles.",
    steps: [
      "Leia os quatro textos resumindo a posição de cada autor em uma linha.",
      "Compare os resumos lado a lado: quem concorda com quem, e quem destoa?",
      "Só então leia a pergunta e escolha o autor que a posição resumida confirma.",
      "Confira voltando ao texto do autor escolhido, procurando a frase que sustenta sua escolha.",
    ],
    pitfalls: [
      "Responder pelo primeiro texto que parece servir, sem checar os outros.",
      "Confundir o assunto em comum com a opinião: todos falam do mesmo tema, o que interessa é o que cada um defende.",
    ],
    example: {
      question:
        "A: remote work boosts productivity. B: it boosts productivity but isolates people. C: the productivity gain is exaggerated. D: it helps productivity, but only in some jobs. Which writer disagrees most with the others about the productivity benefit?",
      answer: "C",
      explanation:
        "A, B e D aceitam o ganho de produtividade (com ressalvas). Só C questiona se ele existe, então C é quem mais discorda.",
    },
    inThisApp:
      "No app a pergunta é sempre \"qual autor...\" com quatro opções (Writer A a D); na prova real há quatro perguntas por conjunto de textos.",
  },
  {
    partTypeId: "reading_part7_gapped_text",
    title: "Reading: gapped text",
    whatItTests:
      "Coesão: como parágrafos se ligam por pronomes, conectivos, ordem do tempo e ideias repetidas.",
    inTheExam:
      "Um artigo com 6 parágrafos removidos e 7 parágrafos soltos, dos quais um é extra. Você encaixa cada um no lugar certo.",
    steps: [
      "Leia o texto base e anote o que o parágrafo antes e o depois da lacuna dizem.",
      "Procure pistas de ligação: this/that/these, he/she, however, as a result, then.",
      "O parágrafo certo conecta com o anterior E com o seguinte. Se só liga a um lado, está errado.",
      "Elimine os parágrafos já usados; o extra é o que não encaixa em nenhuma lacuna.",
    ],
    pitfalls: [
      "Escolher o parágrafo com o mesmo assunto sem checar a ligação com o que vem depois.",
      "Ignorar pronomes sem antecedente claro (\"This breakthrough...\" precisa de um avanço citado antes).",
    ],
    example: {
      question:
        "Antes da lacuna: \"...but one problem remained unsolved for nearly a decade.\"  Depois: \"This breakthrough changed everything.\"  A) In 1998, a young engineer finally found the solution.  B) Many companies had already left the market.",
      answer: "A",
      explanation:
        "\"This breakthrough\" precisa de um avanço mencionado antes, e A apresenta a solução do problema que ficou em aberto. B não resolve o problema nem explica \"this breakthrough\".",
    },
    inThisApp:
      "No app cada questão tem uma lacuna e 4 parágrafos candidatos; na prova real são 6 lacunas e 7 candidatos.",
  },
  {
    partTypeId: "listening_part1_multiple_choice",
    title: "Listening: short extracts",
    whatItTests:
      "Compreensão de trechos curtos: a ideia principal, a opinião ou o motivo de quem fala.",
    inTheExam:
      "Três trechos curtos, cada um com duas perguntas de múltipla escolha. Cada gravação toca duas vezes.",
    steps: [
      "Use a pausa antes do áudio pra ler a pergunta e as opções e prever do que se trata.",
      "Na primeira audição, escolha a resposta provável. Na segunda, confirme ou corrija.",
      "Atenção a palavras de contraste (but, although, in fact): a ideia final vem depois delas.",
      "Não responda pela primeira palavra que combina com uma opção, pois o distrator costuma ser mencionado e depois descartado.",
    ],
    pitfalls: [
      "Marcar a opção que repete uma palavra ouvida, sem checar o que a pessoa conclui.",
      "Ficar preso numa resposta e perder o início da próxima pergunta.",
    ],
    example: {
      question:
        "\"I thought the course would teach me to code, but it was more about how to think about problems.\"  What did the speaker expect from the course?",
      answer: "Learn to code",
      explanation:
        "A expectativa vem ANTES do \"but\": ela esperava aprender a programar. O que o curso foi de fato (pensar sobre problemas) vem depois e é a resposta pra outra pergunta.",
    },
    inThisApp:
      "O áudio é gerado por IA e toca até 2 vezes. Aqui há 4 opções por pergunta; na prova real as perguntas desse tipo têm 3.",
  },
  {
    partTypeId: "listening_part2_sentence_completion",
    title: "Listening: sentence completion",
    whatItTests:
      "Ouvir informação específica (nomes, números, termos) e escrevê-la corretamente.",
    inTheExam:
      "Um monólogo longo e 8 frases com lacuna. Você escreve de 1 a 3 palavras ouvidas, exatamente como foram ditas.",
    steps: [
      "Antes do áudio, leia as frases e preveja a classe da palavra que falta (número? lugar? substantivo?).",
      "Escreva as palavras como foram ditas, sem reformular nem trocar por sinônimos.",
      "Releia a frase completa com a resposta: ela precisa ser gramatical.",
      "Confira a ortografia e não passe de três palavras.",
    ],
    pitfalls: [
      "Parafrasear em vez de copiar o que ouviu.",
      "Escrever uma frase inteira em vez de só as palavras que faltam.",
      "Errar a ortografia de palavras comuns, que contam como erro.",
    ],
    example: {
      question:
        "Visitors should arrive at the main entrance ___ minutes before the tour starts.  (áudio: \"...at least fifteen minutes early\")",
      answer: "fifteen",
      explanation:
        "A palavra vem direto do áudio (\"fifteen\") e completa a frase com sentido. Não escreva \"15\" se pediram palavras, nem \"at least fifteen\": a lacuna só precisa do que falta.",
    },
  },
  {
    partTypeId: "listening_part3_multiple_choice",
    title: "Listening: interview",
    whatItTests:
      "Acompanhar uma conversa mais longa: opiniões, atitudes e como a opinião de quem fala muda ao longo da fala.",
    inTheExam:
      "Uma entrevista ou discussão com 6 perguntas de múltipla escolha (A-D), na ordem do áudio.",
    steps: [
      "Leia as perguntas antes pra saber que opinião ou atitude vai ser cobrada.",
      "Preste atenção à opinião FINAL de quem fala: muita gente começa dizendo uma coisa e termina corrigindo.",
      "As perguntas seguem a ordem do áudio, então use isso pra não se perder.",
      "Atenção a palavras como actually, in fact, what surprised me: costumam marcar a conclusão.",
    ],
    pitfalls: [
      "Responder pela primeira ideia, sem esperar a correção que vem logo depois.",
      "Escolher a opção mais forte ou dramática: a resposta costuma ser mais moderada.",
    ],
    example: {
      question:
        "\"I expected the research trips to be the hardest part, but structuring the chapters afterwards turned out to be far more demanding.\"  What was the hardest part of writing the book?",
      answer: "Organising the material",
      explanation:
        "Ela começa com uma expectativa (as viagens), mas a opinião final, depois do \"but\", é que organizar os capítulos foi muito mais difícil. Vale o que vem depois da correção.",
    },
    inThisApp: "O áudio é gerado por IA e toca até 2 vezes.",
  },
  {
    partTypeId: "listening_part4_multiple_matching",
    title: "Listening: multiple matching",
    whatItTests:
      "Entender a ideia geral e a atitude de cada falante, mesmo quando as palavras do áudio não coincidem com as da opção.",
    inTheExam:
      "Cinco falantes curtos sobre o mesmo tema, e duas tarefas de associação: você liga cada falante a uma opção (A-H) entre oito.",
    steps: [
      "Leia as oito opções antes do áudio e sublinhe a ideia central de cada uma.",
      "Ouça a atitude geral de cada falante, não uma palavra isolada.",
      "As opções são paráfrases: raramente repetem o que foi dito literalmente.",
      "Na segunda audição, confirme as respostas e preencha as que faltaram. Uma opção de cada tarefa sobra.",
    ],
    pitfalls: [
      "Associar pela palavra repetida em vez do sentido.",
      "Dar a mesma resposta pra dois falantes: cada opção só vale uma vez.",
    ],
    example: {
      question:
        "\"Everyone said working from home would be easier, but I miss having people to bounce ideas off.\"  What is the speaker's main point?",
      answer: "She lost valuable collaboration.",
      explanation:
        "Depois do \"but\" vem a ideia central: ela sente falta de trocar ideias com os outros. A opção correta parafraseia isso (perdeu a colaboração), sem repetir as palavras do áudio.",
    },
    inThisApp:
      "No app cada questão traz um único falante e pergunta o ponto principal; na prova real são cinco falantes ligados a oito opções.",
  },
];

export function findLesson(partTypeId: string): Lesson | undefined {
  return LESSONS.find((l) => l.partTypeId === partTypeId);
}
