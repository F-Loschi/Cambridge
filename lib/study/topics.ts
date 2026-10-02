import type { PartTypeDef } from "@/lib/agent/partTypeCatalog";

export interface TopicExample {
  en: string;
  note: string;
}

export interface TopicGroup {
  title: string;
  intro?: string;
  examples: TopicExample[];
}

export interface Topic {
  id: string;
  title: string;
  tagline: string;
  concept: string[];
  groups: TopicGroup[];
  howToStudy: string[];
  pitfalls: string[];
  inTheExam: string;
  exercise: Pick<PartTypeDef, "kind" | "calibrationExamples" | "maxAnswerWords">;
}

/** The part_type stored on a topic's exercises in question_bank. */
export function topicExerciseId(topicId: string): string {
  return `topic_${topicId}`;
}

/** A topic's exercise generator, shaped like a catalog part type but kept out of PART_TYPES. */
export function topicExerciseDef(topic: Topic): PartTypeDef {
  return {
    id: topicExerciseId(topic.id),
    skill: "reading_use_of_english",
    label: `Tópico — ${topic.title}`,
    ...topic.exercise,
  };
}

// Original explanations and examples (not real exam material).
export const TOPICS: Topic[] = [
  {
    id: "collocations",
    title: "Colocações lexicais",
    tagline: "Quais palavras andam juntas em inglês, e por que traduzir palavra por palavra falha.",
    concept: [
      "Colocação é a combinação de palavras que os falantes nativos usam juntas de forma natural. Não é regra de gramática: é costume da língua. Dizemos heavy rain, e não strong rain, embora heavy e strong tenham sentidos próximos.",
      "Pra quem fala português, a tradução palavra por palavra quase sempre falha. \"Fazer uma pergunta\" é ask a question (nunca make a question), \"prestar atenção\" é pay attention, \"perder tempo\" é waste time. Cada língua escolheu seu próprio verbo.",
      "A regra de ouro é aprender a palavra junto com o par, nunca sozinha. Em vez de decorar decision, decore make a decision. Assim, quando você escreve ou escolhe uma alternativa, o par certo já vem pronto.",
      "Colocações são o que separa um texto B2 de um C1: a combinação natural soa fluente, e a \"quase certa\" soa estrangeira, mesmo sendo compreensível.",
    ],
    groups: [
      {
        title: "Verbo + substantivo",
        intro: "O grupo mais cobrado. Make e do são os que mais confundem, e take, pay, break e keep também têm seus pares fixos.",
        examples: [
          { en: "make a mistake / make progress / make an effort / make a decision", note: "Make costuma indicar criar ou produzir um resultado: um erro, um avanço, um esforço, uma decisão." },
          { en: "do homework / do research / do your best / do damage", note: "Do costuma indicar atividade, tarefa ou obrigação, e aparece com damage, harm e good." },
          { en: "take a risk / take a chance / take responsibility / take place", note: "Take place significa acontecer (the meeting took place on Friday), e não \"tomar lugar\"." },
          { en: "pay attention / pay a compliment / pay a visit", note: "Em inglês é PAY attention. Nunca give nem make attention." },
          { en: "waste time / save time / spend time / lose track of time", note: "Time combina com vários verbos de uso: waste (desperdiçar), save (economizar), spend (passar)." },
          { en: "break the law / break a record / break a promise / break the news", note: "Break se estende além do sentido físico: quebrar uma lei, um recorde, uma promessa." },
          { en: "keep a secret / keep in touch / keep your promise", note: "Keep traz a ideia de manter algo como está." },
        ],
      },
      {
        title: "Adjetivo + substantivo",
        intro: "O adjetivo \"parecido\" quase nunca serve. A combinação fixa é a que soa natural.",
        examples: [
          { en: "heavy rain / heavy traffic / a heavy smoker", note: "Heavy, e não strong, com chuva e trânsito. O oposto de heavy rain é light rain." },
          { en: "strong coffee / strong wind / a strong opinion", note: "Strong combina com bebidas e vento. Café fraco é weak coffee." },
          { en: "high hopes / high standards / high risk", note: "High vai com expectativas e padrões. Dizemos high prices, mas low prices." },
          { en: "a deep breath / deep sleep / deep concern", note: "Deep também aparece em sentidos abstratos." },
          { en: "a slim chance / a vast majority / fierce competition", note: "São combinações intensas e fixas: não troque slim por thin, nem fierce por strong." },
        ],
      },
      {
        title: "Advérbio + adjetivo",
        intro: "Os intensificadores não são intercambiáveis: cada um prefere certos adjetivos.",
        examples: [
          { en: "deeply concerned / bitterly disappointed / painfully shy", note: "Advérbio de emoção forte com adjetivo de emoção." },
          { en: "highly unlikely / highly recommended / widely available", note: "Highly e widely têm usos fixos: não diga highly big." },
          { en: "utterly ridiculous / absolutely exhausted / completely impossible", note: "Utterly e absolutely vão com adjetivos extremos. Não se diz very ridiculous nem very exhausted." },
          { en: "fully aware / perfectly clear", note: "Fully e perfectly combinam com adjetivos de estado e entendimento." },
        ],
      },
      {
        title: "Substantivo + of + substantivo",
        intro: "São unidades de contagem para substantivos não contáveis, ou expressões de sensação.",
        examples: [
          { en: "a piece of advice / a piece of information", note: "Advice e information são não contáveis: nunca an advice, nem informations." },
          { en: "a sense of humour / a sense of belonging", note: "Sense of, e não feeling of, para qualidades abstratas." },
          { en: "a stroke of luck / a wave of panic / a surge of interest", note: "Cada substantivo de movimento ou golpe tem seu par fixo." },
        ],
      },
    ],
    howToStudy: [
      "Anote a combinação inteira ao ler ou ouvir (make a decision), nunca a palavra isolada.",
      "Use um dicionário de colocações pra checar o par: os dicionários online mostram as colocações mais comuns de cada palavra.",
      "Agrupe por palavra-base: faça uma lista \"make: ...\", \"do: ...\", \"take: ...\" e revise por semana.",
      "Use a combinação numa frase sua em até 24 horas: escrever fixa muito mais do que só ler.",
      "Nas questões de múltipla escolha, olhe também as alternativas erradas: elas mostram combinações que não existem, e isso também é aprendizado.",
    ],
    pitfalls: [
      "Traduzir literalmente do português (make a question, give attention, do a mistake).",
      "Confundir make e do: se o sentido é criar um resultado, em geral é make; se é uma tarefa ou atividade, em geral é do.",
      "Escolher um sinônimo \"mais sofisticado\" que não combina (high rain, strong traffic).",
      "Esquecer que cada língua tem seus pares: a combinação que soa natural em português costuma ter outro verbo em inglês.",
    ],
    inTheExam:
      "Aparece diretamente em Use of English Parte 1 (multiple-choice cloze), pesa em Part 2 e 3, e em Writing e Speaking as colocações naturais contam pontos em Language.",
    exercise: {
      kind: "multiple_choice",
      calibrationExamples: [
        `Prompt: We need to ___ a decision before Friday.
Options: A) do  B) make  C) put  D) set
Answer: B) make
(One collocation per item: the correct verb forms a fixed pair with the noun; the other options are real verbs that do not pair with it.)`,
        `Prompt: There was ___ rain all night, so the match was cancelled.
Options: A) strong  B) heavy  C) high  D) deep
Answer: B) heavy`,
        `Prompt: Can I give you a piece of ___ before you decide?
Options: A) advice  B) advices  C) advise  D) advisory
Answer: A) advice
(Include occasional noun + of + noun and adverb + adjective items, not only verb + noun. Every option must be a real word, and only one may form the collocation.)`,
      ],
    },
  },
  {
    id: "phrasal_verbs",
    title: "Phrasal verbs",
    tagline: "O que são, como a posição do objeto muda e como aprender os mais usados sem decorar listas soltas.",
    concept: [
      "Phrasal verb é um verbo mais uma partícula (um advérbio ou preposição) que, juntos, formam um sentido novo, muitas vezes impossível de adivinhar pelas partes: give up (desistir), look after (cuidar de), put off (adiar).",
      "Trate cada um como uma palavra nova de vocabulário, com a sua própria regra de uso, e não como gramática. Não tente traduzir o verbo e a partícula separadamente.",
      "Muitos têm vários sentidos, e o contexto decide qual vale: take off pode ser o avião decolar, tirar uma roupa ou fazer sucesso de repente.",
      "Em inglês informal são a escolha natural; em textos formais, o verbo de origem latina costuma ser melhor (find out → discover, put off → postpone). Saber a diferença de registro é parte do nível C1.",
    ],
    groups: [
      {
        title: "Os quatro tipos gramaticais",
        intro: "Saber o tipo é saber onde o objeto vai. É o que mais derruba candidatos.",
        examples: [
          { en: "The plane took off. / The car broke down. / She grew up in Lisbon.", note: "Intransitivos: não têm objeto." },
          { en: "She turned down the offer. / She turned the offer down. / She turned it down.", note: "Transitivo separável: o objeto pode ir no meio. Se o objeto é um pronome (it, them, him), ele TEM que ir no meio: turn it down, nunca turn down it." },
          { en: "I'm looking after my niece. / We came across an old photo. / Look into the problem.", note: "Transitivo inseparável: o objeto vem sempre depois da partícula, mesmo sendo pronome: look after her." },
          { en: "I can't put up with the noise. / I'm looking forward to the trip. / They came up with a plan.", note: "Com três partes são sempre inseparáveis. Em look forward to e get used to, o \"to\" é preposição: depois vem -ing (look forward to meeting you)." },
        ],
      },
      {
        title: "O que a partícula costuma sugerir",
        intro: "Não é regra fixa, mas ajuda a adivinhar o sentido de um phrasal verb novo.",
        examples: [
          { en: "eat up / use up / cheer up / speed up", note: "UP: completar, esgotar ou aumentar." },
          { en: "cut down / slow down / break down / turn down", note: "DOWN: reduzir, diminuir ou falhar." },
          { en: "run out of / hand out / find out / work out", note: "OUT: acabar, distribuir ou descobrir." },
          { en: "set off / call off / go off / put off", note: "OFF: começar uma viagem, cancelar, soar (alarme) ou adiar." },
          { en: "carry on / go on / keep on / hold on", note: "ON: continuar." },
        ],
      },
      {
        title: "Vários sentidos pro mesmo verbo",
        examples: [
          { en: "take off: the plane took off / take off your coat / her career took off", note: "Decolar, tirar a roupa, fazer sucesso." },
          { en: "pick up: pick up the phone / pick up Spanish quickly / pick up a friend", note: "Pegar, aprender sem esforço, buscar alguém." },
          { en: "bring up: bring up children / bring up a problem", note: "Criar filhos, mencionar um assunto." },
          { en: "put off: put off the meeting / the smell put me off", note: "Adiar, ou desanimar alguém." },
          { en: "get over: get over a cold / get over the shock", note: "Se recuperar de uma doença ou de um choque." },
        ],
      },
      {
        title: "Registro: phrasal verb ou verbo formal",
        intro: "Em Writing formal, prefira o verbo formal. Em e-mails informais e em Speaking, o phrasal verb é natural.",
        examples: [
          { en: "find out → discover", note: "We found out the truth. / Researchers discovered the cause." },
          { en: "put off → postpone", note: "They put off the match. / The committee postponed the vote." },
          { en: "carry out → conduct", note: "We carried out a survey. / The team conducted a study." },
          { en: "set up → establish", note: "She set up a company. / The firm was established in 1990." },
        ],
      },
    ],
    howToStudy: [
      "Aprenda sempre numa frase com o objeto típico (put off a meeting), nunca só o verbo com a partícula.",
      "Ao anotar, marque o tipo: \"turn down sth (separável)\", \"look after sb (inseparável)\".",
      "Comece pelos mais frequentes e estude uns cinco por dia: a fila de revisão do app ajuda a fixar os que você errar.",
      "Escolha um método (agrupar por verbo-base ou por partícula) e mantenha: misturar os dois confunde.",
      "Não traduza as partes: pense no phrasal verb como uma palavra só, com um sentido só.",
    ],
    pitfalls: [
      "Pôr o pronome depois da partícula nos separáveis: \"turn down it\" está errado, o certo é \"turn it down\".",
      "Esquecer o -ing depois de look forward to, get used to e object to: o \"to\" ali é preposição.",
      "Trocar a partícula por outra parecida: take in, take on e take up têm sentidos totalmente diferentes.",
      "Usar phrasal verbs demais em texto formal, onde soam informais.",
    ],
    inTheExam:
      "Aparecem em Use of English Partes 1 e 4 (key word transformation), em Listening e Reading, e usá-los no lugar certo em Speaking e Writing mostra naturalidade.",
    exercise: {
      kind: "multiple_choice",
      calibrationExamples: [
        `Prompt: The plane ___ at 6 a.m., so we have to be at the airport by 4.
Options: A) takes off  B) takes out  C) takes up  D) takes in
Answer: A) takes off
(One phrasal verb per item; the options share the verb but differ in the particle, so only one fits the meaning.)`,
        `Prompt: I can't ___ his constant complaining any longer.
Options: A) put up with  B) put off  C) put out  D) put down to
Answer: A) put up with`,
        `Prompt: The match was ___ because of the heavy rain.
Options: A) called off  B) called in  C) called up  D) called for
Answer: A) called off`,
      ],
    },
  },
  {
    id: "dependent_prepositions",
    title: "Preposições dependentes",
    tagline: "Qual preposição acompanha cada verbo, adjetivo ou substantivo, sem tentar deduzir pelo português.",
    concept: [
      "Muitas palavras exigem uma preposição específica depois delas: depend ON, interested IN, afraid OF, reason FOR. Não há lógica que permita deduzir, e o português costuma usar outra (depender DE, interessado EM, medo DE).",
      "A solução é a mesma de colocações: aprenda a palavra com a preposição. Ao ver depend, guarde depend on.",
      "Uma regra que ajuda: depois de uma preposição, o verbo vai no -ing (interested in learning, insist on going, object to being told).",
    ],
    groups: [
      {
        title: "Adjetivo + preposição",
        examples: [
          { en: "good at / bad at / keen on / fond of", note: "Habilidade e gosto: good AT, keen ON, fond OF." },
          { en: "afraid of / aware of / capable of / tired of", note: "Muitos adjetivos de estado usam OF." },
          { en: "responsible for / famous for / known for", note: "Responsabilidade e fama usam FOR." },
          { en: "different from (to) / similar to / married to", note: "No inglês britânico, different pede FROM ou TO. \"Different than\" é uso americano: evite na prova." },
        ],
      },
      {
        title: "Verbo + preposição",
        examples: [
          { en: "depend on / rely on / insist on / focus on", note: "ON é a preposição mais comum depois de verbos." },
          { en: "apologise for / blame someone for / thank someone for", note: "Desculpar-se, culpar e agradecer pedem FOR." },
          { en: "complain about / worry about / think about", note: "ABOUT para assuntos." },
          { en: "benefit from / suffer from / result from", note: "FROM para origem ou causa. Result IN é o contrário: causa o resultado." },
          { en: "succeed in / believe in / specialise in", note: "IN com ideias de sucesso e crença." },
          { en: "consist of / approve of / dream of", note: "OF depois desses." },
        ],
      },
      {
        title: "Substantivo + preposição",
        examples: [
          { en: "a reason for / a solution to / a demand for", note: "Reason FOR, solution TO, demand FOR." },
          { en: "an increase in / a rise in / a change in", note: "Mudanças de quantidade usam IN: an increase IN prices." },
          { en: "damage to / an attitude towards / a lack of", note: "Cada substantivo tem a sua." },
        ],
      },
      {
        title: "Quando o \"to\" é preposição",
        intro: "Depois de uma preposição o verbo vai pro -ing, e isso inclui o \"to\" de algumas expressões.",
        examples: [
          { en: "look forward to seeing you", note: "Look forward to + -ing." },
          { en: "I'm used to getting up early.", note: "Be used to + -ing (estar acostumado). Used to + verbo base é outra coisa: hábito no passado." },
          { en: "She objected to being told what to do.", note: "Object to + -ing." },
        ],
      },
    ],
    howToStudy: [
      "Anote a palavra com a preposição, em frase, e releia a lista toda semana.",
      "Agrupe por preposição (todos os verbos com ON, todos os adjetivos com OF) pra ver padrões.",
      "Cubra a preposição e tente lembrar: é o jeito mais rápido de saber o que ainda não fixou.",
      "Quando errar, corrija a frase inteira em vez de só a preposição.",
    ],
    pitfalls: [
      "Usar a preposição que o português usaria (depend of, interested on, afraid from).",
      "Esquecer o -ing depois de preposição (insist on to go).",
      "Trocar FOR e OF: responsible OF está errado, o certo é responsible FOR.",
      "Misturar as preposições de substantivos parecidos: solution TO, mas reason FOR.",
    ],
    inTheExam:
      "É a base do Use of English Parte 2 (open cloze), onde a lacuna é muitas vezes uma preposição, e também aparece em key word transformation.",
    exercise: {
      kind: "short_answer",
      maxAnswerWords: 1,
      calibrationExamples: [
        `Prompt: She is very keen ___ playing tennis.
Answer: on
(One word only — the dependent preposition. The sentence must allow exactly one preposition.)`,
        `Prompt: The new law resulted ___ a huge increase in prices.
Answer: in`,
      ],
    },
  },
  {
    id: "linking_words",
    title: "Conectivos e marcadores de discurso",
    tagline: "Como ligar ideias de contraste, causa, adição e condição sem errar a gramática de cada um.",
    concept: [
      "Conectivos mostram a relação entre duas ideias: contraste, causa, consequência, adição, condição. Escolher o certo é questão de sentido e de gramática.",
      "A diferença entre eles muitas vezes é o que vem depois: although pede uma oração inteira (sujeito + verbo), enquanto despite e in spite of pedem um substantivo ou -ing.",
      "Alguns ficam no meio da frase e outros começam uma frase nova, com pontuação própria: however vem entre vírgulas ou depois de ponto.",
    ],
    groups: [
      {
        title: "Contraste e concessão",
        examples: [
          { en: "Although it was raining, we went out.", note: "Although + oração completa." },
          { en: "Despite the rain, we went out. / Despite being tired, she kept working.", note: "Despite e in spite of + substantivo ou -ing. Nunca \"despite of\"." },
          { en: "Despite the fact that it was raining, we went out.", note: "Para usar uma oração depois de despite, use the fact that." },
          { en: "He is rich. However, he is not happy.", note: "However começa uma frase nova, com vírgula depois." },
          { en: "Some people like the city, whereas others prefer the countryside.", note: "Whereas e while contrastam dois lados." },
        ],
      },
      {
        title: "Causa e consequência",
        examples: [
          { en: "We stayed in because it was raining. / We stayed in because of the rain.", note: "Because + oração. Because of + substantivo." },
          { en: "Due to / owing to the delay, the match started late.", note: "Due to e owing to + substantivo." },
          { en: "It was raining, so we stayed in. / It was raining; therefore, we stayed in.", note: "So é informal. Therefore e consequently são formais." },
        ],
      },
      {
        title: "Adição",
        examples: [
          { en: "The flat is cheap. Moreover, it is close to the centre.", note: "Moreover e furthermore são formais." },
          { en: "In addition to the salary, there is a bonus.", note: "In addition to + substantivo ou -ing." },
        ],
      },
      {
        title: "Condição e finalidade",
        examples: [
          { en: "You can borrow it provided that you return it.", note: "Provided that e as long as significam apenas se." },
          { en: "Take an umbrella in case it rains.", note: "In case é por precaução, e não se." },
          { en: "She left early so as to avoid the traffic.", note: "So as to e in order to + verbo base indicam finalidade." },
        ],
      },
    ],
    howToStudy: [
      "Aprenda cada conectivo com o que vem depois dele: oração, substantivo ou -ing.",
      "Monte uma tabela com colunas \"+ oração\" e \"+ substantivo/-ing\" e coloque cada um no lugar certo.",
      "Em textos seus, troque os conectivos repetidos (but, so) por opções mais variadas.",
      "Releia o que escreveu e confira a pontuação em however, therefore e moreover.",
    ],
    pitfalls: [
      "Usar although com substantivo (although the rain) ou despite com oração sem the fact that.",
      "Escrever \"despite of\": o certo é despite ou in spite of.",
      "Ligar duas orações só com vírgula antes de however: precisa de ponto ou ponto e vírgula.",
      "Confundir in case (por precaução) com if (condição).",
    ],
    inTheExam:
      "Aparece em Use of English Partes 1 e 2, é a chave de Reading Parte 7 (gapped text) e vale muito em Writing, onde a organização é um dos critérios.",
    exercise: {
      kind: "multiple_choice",
      calibrationExamples: [
        `Prompt: ___ the heavy traffic, we arrived on time.
Options: A) Although  B) Despite  C) However  D) Whereas
Answer: B) Despite
(One linking word per item; the options differ in grammar or meaning, so only one fits the structure after the gap.)`,
        `Prompt: The flat is small. ___, it is very close to the centre.
Options: A) Despite  B) Because  C) However  D) Unless
Answer: C) However`,
      ],
    },
  },
  {
    id: "conditionals",
    title: "Condicionais e inversão",
    tagline: "Os tipos de condicional, wish e as formas formais com inversão (Had I known...).",
    concept: [
      "Condicionais ligam uma condição a um resultado, e cada tipo tem uma combinação fixa de tempos verbais. O erro mais comum é usar will ou would dentro da oração do if.",
      "No nível C1 você também precisa reconhecer as formas formais, em que o if desaparece e o auxiliar vai pro início da frase (inversão): Had I known, I would have called.",
    ],
    groups: [
      {
        title: "Os tipos principais",
        examples: [
          { en: "If you heat ice, it melts.", note: "Zero: verdade geral. If + presente, presente." },
          { en: "If it rains, we will stay home.", note: "Primeira: possibilidade real. If + presente, will + verbo." },
          { en: "If I were you, I would take the job.", note: "Segunda: situação irreal agora. If + passado, would + verbo. Formalmente se usa were para todas as pessoas." },
          { en: "If she had studied, she would have passed.", note: "Terceira: passado irreal. If + past perfect, would have + particípio." },
          { en: "If I had taken the job, I would be rich now.", note: "Mista: passado que afeta o presente." },
        ],
      },
      {
        title: "Wish e if only",
        examples: [
          { en: "I wish I lived by the sea.", note: "Wish + passado simples: desejo sobre o presente." },
          { en: "I wish I had listened to her.", note: "Wish + past perfect: arrependimento sobre o passado." },
          { en: "I wish you would stop interrupting.", note: "Wish + would: irritação com o comportamento de alguém." },
        ],
      },
      {
        title: "Inversão formal",
        intro: "O if some e o auxiliar vai pro início. É o jeito formal de escrever.",
        examples: [
          { en: "Had I known, I would have called. (= If I had known...)", note: "Terceira condicional com Had." },
          { en: "Should you need help, please call us. (= If you need help...)", note: "Should pra possibilidade, em avisos formais." },
          { en: "Were she to resign, the company would suffer. (= If she were to resign...)", note: "Were + to pra uma situação hipotética." },
        ],
      },
      {
        title: "Alternativas ao if",
        examples: [
          { en: "Unless you hurry, you will miss the train.", note: "Unless = if not." },
          { en: "Provided that you pay, you can stay.", note: "Provided that e as long as = apenas se." },
          { en: "Suppose / Supposing you won, what would you do?", note: "Suppose pra hipóteses." },
        ],
      },
    ],
    howToStudy: [
      "Decore a estrutura de cada tipo como fórmula: If + [tempo], [tempo].",
      "Escreva três frases suas com cada tipo, sobre situações da sua vida.",
      "Treine transformar: pegue uma frase com if e reescreva com inversão, e vice-versa.",
      "Em key word transformation, desconfie sempre: unless, provided, otherwise e as long as pedem estruturas específicas.",
    ],
    pitfalls: [
      "Usar will ou would depois do if (\"if I will go\", \"if I would have known\").",
      "Misturar o tempo do if com o do resultado entre tipos diferentes por acidente.",
      "Dizer unless ... not (unless you don't hurry): unless já tem sentido negativo.",
      "Esquecer que na inversão não há if (\"if had I known\").",
    ],
    inTheExam:
      "É clássico em Use of English Parte 4 (key word transformation) e em Parte 2 (open cloze), e a inversão eleva o registro em Writing formal.",
    exercise: {
      kind: "multiple_choice",
      calibrationExamples: [
        `Prompt: If I ___ you, I would accept the offer.
Options: A) am  B) were  C) will be  D) would be
Answer: B) were
(One conditional form per item; the distractors are the typical wrong tense choices.)`,
        `Prompt: ___ I known about the delay, I would have left earlier.
Options: A) If  B) Had  C) Should  D) Would
Answer: B) Had`,
      ],
    },
  },
  {
    id: "passive_causative",
    title: "Voz passiva e causativa",
    tagline: "Quando e como usar a passiva, incluindo com verbos de relato, e o have something done.",
    concept: [
      "Na voz passiva, o foco sai de quem faz a ação e vai pra quem a sofre. Forma-se com be + particípio passado, no tempo verbal certo: is made, was built, has been done, will be sent.",
      "Usamos a passiva quando quem faz a ação é desconhecido, óbvio ou sem importância, e em textos formais ou científicos.",
      "A causativa (have/get something done) é parecida: indica que alguém fez algo por você, normalmente um serviço, em vez de você mesmo fazer.",
    ],
    groups: [
      {
        title: "A passiva em vários tempos",
        examples: [
          { en: "The bridge is repaired every year.", note: "Presente simples: is/are + particípio." },
          { en: "The bridge was built in 1990.", note: "Passado simples: was/were + particípio." },
          { en: "The report has been finished.", note: "Present perfect: has/have been + particípio." },
          { en: "The meeting will be held on Monday.", note: "Futuro: will be + particípio." },
          { en: "The road is being repaired.", note: "Presente contínuo: is/are being + particípio." },
        ],
      },
      {
        title: "Passiva com verbos de relato",
        intro: "Muito formal e comum em notícias e na prova.",
        examples: [
          { en: "It is said that he is very rich. / He is said to be very rich.", note: "Is said + to + verbo: opinião geral sobre o presente." },
          { en: "He is believed to have left the country.", note: "To have + particípio: algo anterior, no passado." },
          { en: "The company is expected to announce a loss.", note: "Expected, reported, thought, known seguem o mesmo molde." },
        ],
      },
      {
        title: "Have / get something done",
        examples: [
          { en: "I had my car repaired yesterday.", note: "Alguém consertou o carro por mim. Não fui eu: I repaired my car é outra coisa." },
          { en: "She is having her hair cut.", note: "Funciona em qualquer tempo: have/has + objeto + particípio." },
          { en: "He got his passport stolen.", note: "Também serve para algo ruim que aconteceu com você." },
        ],
      },
    ],
    howToStudy: [
      "Reescreva frases ativas em passivas em todos os tempos, até a estrutura sair sem pensar.",
      "Leia notícias em inglês e sublinhe passivas com verbos de relato (is said to, is expected to).",
      "Em key word transformation, sempre se pergunte: o sujeito mudou? Então a passiva provavelmente é a estrutura pedida.",
      "Pense em serviços da sua vida (cortar o cabelo, consertar o carro) e diga cada um com have something done.",
    ],
    pitfalls: [
      "Esquecer o be e escrever \"the car repaired\" em vez de \"the car was repaired\".",
      "Tentar passiva com verbo intransitivo: happen e arrive não têm passiva.",
      "Confundir \"I repaired my car\" (eu fiz) com \"I had my car repaired\" (alguém fez).",
      "Usar by + agente sem necessidade: se não importa quem fez, omita.",
    ],
    inTheExam:
      "Cai em Use of English Parte 4 (key word transformation) e Parte 2, e em Writing formal a passiva dá um tom mais impessoal e adequado.",
    exercise: {
      kind: "multiple_choice",
      calibrationExamples: [
        `Prompt: The new library ___ next month by the mayor.
Options: A) will open  B) will be opened  C) is opening  D) opens
Answer: B) will be opened
(One passive/causative form per item; the distractors are the active or wrong-tense versions.)`,
        `Prompt: I need to ___ my laptop repaired.
Options: A) make  B) have  C) do  D) put
Answer: B) have`,
      ],
    },
  },
  {
    id: "verb_patterns",
    title: "Padrões verbais: -ing ou to?",
    tagline: "Qual verbo pede -ing, qual pede to + infinitivo, e os que mudam de sentido.",
    concept: [
      "Em inglês, o verbo que vem depois de outro verbo precisa de uma forma específica: -ing, to + infinitivo ou infinitivo sem to. É o verbo da frente que decide, e não há regra geral: precisa decorar.",
      "Alguns verbos aceitam as duas formas com sentidos diferentes: stop, remember, try, regret, forget. É aqui que muita gente erra mesmo sabendo as listas.",
    ],
    groups: [
      {
        title: "Verbo + -ing",
        examples: [
          { en: "enjoy / avoid / suggest / admit / deny / risk / consider / mind / postpone / keep", note: "She suggested going early. Nunca suggested to go." },
        ],
      },
      {
        title: "Verbo + to + infinitivo",
        examples: [
          { en: "decide / hope / manage / afford / refuse / agree / plan / promise / offer / tend", note: "He refused to help. We can't afford to travel." },
        ],
      },
      {
        title: "Verbo + objeto + to + infinitivo",
        examples: [
          { en: "persuade / allow / advise / encourage / expect / want", note: "She persuaded him to apply. Nunca \"persuaded that he apply\"." },
        ],
      },
      {
        title: "Infinitivo sem to",
        examples: [
          { en: "let / make / would rather / had better + modais", note: "She made me laugh. Let him go. Os verbos modais (can, must) também pedem o infinitivo sem to." },
        ],
      },
      {
        title: "Verbos que mudam de sentido",
        intro: "A forma muda o significado, e cada par é uma pegadinha clássica.",
        examples: [
          { en: "stop to smoke / stop smoking", note: "Parar pra fumar (interromper algo pra fazer isso) / parar de fumar." },
          { en: "remember to lock / remember locking", note: "Lembrar de trancar (antes) / lembrar que trancou (depois)." },
          { en: "try to open / try opening", note: "Tentar abrir (esforço) / experimentar abrir (testar uma solução)." },
          { en: "regret to inform / regret telling", note: "Lamentar informar (agora) / arrepender-se de ter contado (passado)." },
        ],
      },
    ],
    howToStudy: [
      "Aprenda os verbos por grupo, com uma frase de exemplo para cada.",
      "Cubra o que vem depois do verbo e tente escrever a forma certa de memória.",
      "Dê atenção especial aos que mudam de sentido, e crie uma frase sua para cada um.",
      "Quando errar numa questão, anote o verbo e o padrão, e não só a resposta certa.",
    ],
    pitfalls: [
      "Usar to depois de verbos de -ing (suggest to go, enjoy to read).",
      "Esquecer o objeto antes do to (\"persuaded to go\" em vez de \"persuaded him to go\").",
      "Usar to depois de let e make (\"let him to go\", \"made me to laugh\").",
      "Não perceber que stop, remember e try mudam de sentido conforme a forma.",
    ],
    inTheExam:
      "Cai em Use of English Partes 1, 2 e 4, e acertar o padrão verbal é a base de várias transformações.",
    exercise: {
      kind: "multiple_choice",
      calibrationExamples: [
        `Prompt: She suggested ___ the meeting until next week.
Options: A) to postpone  B) postponing  C) postpone  D) to postponing
Answer: B) postponing
(One verb pattern per item; the options are the four typical wrong/right forms after the main verb.)`,
        `Prompt: The teacher persuaded him ___ for the scholarship.
Options: A) applying  B) to apply  C) apply  D) that he apply
Answer: B) to apply`,
      ],
    },
  },
  {
    id: "affixes",
    title: "Prefixos e sufixos",
    tagline: "Como formar palavras (adjetivo → substantivo, negativos, advérbios) pra acertar word formation.",
    concept: [
      "A maioria das palavras do inglês se forma com prefixos (no início) e sufixos (no fim). Quem domina os padrões consegue montar a palavra certa mesmo sem nunca a ter visto.",
      "O sufixo geralmente define a classe gramatical: -tion forma substantivos, -ful forma adjetivos, -ly forma advérbios. O prefixo costuma mudar o sentido, como em unhappy e impossible.",
      "Na prova, o primeiro passo é decidir a classe que a lacuna pede. O segundo é verificar se o sentido exige um negativo ou um plural.",
    ],
    groups: [
      {
        title: "Prefixos negativos",
        examples: [
          { en: "unhappy / unable / unfair", note: "UN- é o mais comum, com adjetivos e verbos." },
          { en: "impossible / immature / imbalance", note: "IM- antes de p, m e b." },
          { en: "illegal / illogical / irregular / irresponsible", note: "IL- antes de l e IR- antes de r." },
          { en: "inactive / incorrect / dishonest / disagree / misunderstand", note: "IN-, DIS- e MIS- também negam ou invertem o sentido." },
        ],
      },
      {
        title: "Sufixos de substantivo",
        examples: [
          { en: "decide → decision / create → creation", note: "-ion e -tion, vindo de verbos em -ate, -de, -ct." },
          { en: "enjoy → enjoyment / achieve → achievement", note: "-ment com verbos." },
          { en: "happy → happiness / kind → kindness", note: "-ness com adjetivos; y vira i." },
          { en: "able → ability / possible → possibility", note: "-ity com adjetivos terminados em -able e -ible, e o final muda." },
          { en: "important → importance / absent → absence", note: "-ance e -ence com adjetivos em -ant e -ent." },
        ],
      },
      {
        title: "Sufixos de adjetivo e advérbio",
        examples: [
          { en: "care → careful / careless", note: "-ful (com) e -less (sem) formam opostos." },
          { en: "comfort → comfortable / reason → reasonable", note: "-able e -ible: possível de ser..." },
          { en: "danger → dangerous / fame → famous", note: "-ous com muitos substantivos." },
          { en: "quick → quickly / happy → happily", note: "-ly forma advérbios, e y vira i." },
        ],
      },
      {
        title: "Mudanças de ortografia",
        examples: [
          { en: "happy → happiness / happily", note: "y vira i antes do sufixo." },
          { en: "decide → decision / advise → advice → advisable", note: "O final da raiz pode mudar." },
          { en: "necessary → unnecessary → unnecessarily", note: "Um prefixo e um sufixo juntos na mesma palavra." },
        ],
      },
    ],
    howToStudy: [
      "Estude por famílias de palavras: pegue uma raiz e liste todas as formas (decide, decision, decisive, indecisive).",
      "Memorize os sufixos por classe gramatical (substantivo, adjetivo, advérbio) em colunas.",
      "Ao ler, sublinhe palavras longas e separe prefixo, raiz e sufixo.",
      "Nos exercícios, antes de escrever, diga a classe da lacuna em voz alta: \"aqui precisa de um adjetivo\".",
    ],
    pitfalls: [
      "Acertar a classe mas esquecer que o contexto pede o sentido oposto (un-, in-, dis-).",
      "Usar o prefixo errado (inpossible em vez de impossible, unlogical em vez de illogical).",
      "Esquecer o plural quando há many, several ou another antes da lacuna.",
      "Errar a ortografia: happyness, decisson e similar contam como erro.",
    ],
    inTheExam:
      "É o coração do Use of English Parte 3 (word formation), com a raiz em maiúsculas no fim da linha. A ortografia conta.",
    exercise: {
      kind: "short_answer",
      maxAnswerWords: 1,
      calibrationExamples: [
        `Prompt: She was ___ to attend the meeting because of illness. (ABLE)
Answer: unable
(The root word is given in capitals in parentheses; the answer is ONE word formed from it, and the context must force a single form — e.g. a negative prefix, a noun suffix or an adverb.)`,
        `Prompt: The company announced a ___ in its profits. (INCREASE)
Answer: increase
(Avoid items that accept several forms; check the sentence admits only one.)`,
      ],
    },
  },
];

export function findTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
