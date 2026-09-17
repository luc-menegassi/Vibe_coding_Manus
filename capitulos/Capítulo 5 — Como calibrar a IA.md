# Capítulo 5 — Como calibrar a IA

## Tese

Calibrar uma IA de programação é transformar uma solicitação vaga em um trabalho verificável: fornecer contexto suficiente, limitar o escopo, explicitar critérios de aceitação, pedir mudanças pequenas, revisar a saída e alimentar a próxima interação com evidências. O ganho de velocidade está na geração e na exploração de alternativas; a responsabilidade técnica continua com a pessoa ou equipe que define o problema, aceita o risco, valida o comportamento e decide o que será integrado e operado.

Esse processo não torna a IA infalível. Ele reduz ambiguidade e cria pontos de controle para detectar erros. A calibração é, portanto, uma prática de engenharia de software e de gestão de risco, não uma técnica para delegar julgamento técnico.

## Objetivos de aprendizagem

Ao concluir este capítulo, a pessoa leitora deverá ser capaz de:

1. preparar contexto relevante para que uma IA de programação entenda o repositório, a tarefa e as restrições;
2. restringir uma solicitação a uma mudança pequena, reversível e observável;
3. converter requisitos em critérios de aceitação, casos-limite e testes;
4. conduzir uma revisão em camadas, combinando testes automatizados, análise estática, segurança, dependências e julgamento humano;
5. reconhecer alucinações, dependências suspeitas, APIs inventadas e sinais de excesso de confiança;
6. construir um loop de feedback baseado em evidências, em vez de repetir prompts mais longos;
7. distinguir produtividade de geração de código de responsabilidade pela arquitetura, segurança, conformidade e operação do sistema.

## 1. O que significa calibrar

Uma IA de programação não recebe apenas o texto do prompt. Ferramentas como o GitHub Copilot também usam, conforme a superfície, o arquivo atual, o histórico da conversa e outros elementos de contexto. A documentação recomenda começar com o objetivo geral e depois detalhar requisitos, fornecer exemplos, dividir tarefas complexas, evitar ambiguidade, indicar os arquivos relevantes e iterar quando o resultado não atende ao pedido [1].

Calibrar significa controlar deliberadamente seis variáveis:

- **Contexto:** quais fatos do repositório, do domínio e do ambiente a IA pode usar.
- **Escopo:** o que será alterado e, principalmente, o que não será alterado.
- **Critérios:** como reconhecer que o resultado atende ao objetivo.
- **Evidência:** quais testes, inspeções, documentos e fontes sustentam a decisão.
- **Autonomia:** quais ações a ferramenta pode sugerir, editar ou executar sem aprovação explícita.
- **Feedback:** como um resultado incorreto será descrito e transformado em uma próxima tentativa menor.

Sem esse controle, a interação tende a otimizar uma métrica enganosa: produzir muito código que parece plausível. Código plausível não é necessariamente correto, seguro, compatível com a arquitetura ou adequado ao contexto de negócio.

## 2. Como dar contexto sem despejar o repositório inteiro

Contexto útil é informação selecionada que muda a solução. Antes de pedir uma implementação, forneça o objetivo do componente, o fluxo de dados, as interfaces relevantes, as versões de runtime e dependências, os comandos de validação, as convenções do projeto e as restrições de segurança ou privacidade. Abra ou anexe os arquivos que definem a mudança e retire arquivos irrelevantes da conversa. O próprio GitHub recomenda indicar o código relevante e fechar o que não é pertinente, pois o contexto disponível influencia a resposta [1].

Um pacote mínimo de contexto contém:

1. **Objetivo e usuário afetado:** qual problema será resolvido e qual comportamento é esperado.
2. **Localização:** diretórios, módulos, endpoints, jobs ou componentes envolvidos.
3. **Contrato existente:** tipos, assinaturas, formatos de entrada e saída, códigos de erro e invariantes.
4. **Ambiente:** linguagem, versão, framework, banco, sistema operacional e comandos para instalar, executar, testar e analisar.
5. **Padrões locais:** convenções de nomes, tratamento de erros, logging, autenticação, acessibilidade e arquitetura.
6. **Limites:** arquivos intocáveis, APIs que não podem mudar, orçamento de desempenho, requisitos regulatórios e dados que não devem ser enviados ao modelo.
7. **Evidências:** testes existentes, documentação do projeto, issue, decisão arquitetural e exemplo de comportamento correto.

Quando o padrão é recorrente, o contexto pode ser versionado. O GitHub documenta instruções de repositório em `.github/copilot-instructions.md`, instruções específicas por caminho em `.github/instructions/*.instructions.md` e instruções para agentes em `AGENTS.md`; esses arquivos registram como entender, construir, testar e validar mudanças [2]. O arquivo de instruções deve ser curto, revisado como código e livre de contradições. Ele não substitui a leitura da implementação nem autoriza a ferramenta a ignorar os critérios de revisão.

Não envie segredos, tokens, dados pessoais ou código que a política da organização proíba compartilhar. Se a tarefa exige dados sensíveis, crie um caso reproduzível com dados sintéticos e registre a limitação no pedido.

## 3. Como restringir escopo

Um bom pedido é uma unidade de trabalho, não um plano inteiro de modernização. Delimite o resultado em termos observáveis: “adicionar validação de entrada ao endpoint X, sem alterar o contrato HTTP; incluir testes para entradas válidas, vazias e malformadas; não atualizar dependências”. Para tarefas grandes, peça primeiro um inventário e um plano; depois faça uma mudança por vez. A documentação do GitHub recomenda dividir tarefas complexas em subtarefas simples, inclusive usando testes como exemplos do comportamento desejado [1].

Use uma fronteira explícita:

> **Faça:** altere os arquivos A e B para implementar C.  
> **Não faça:** não refatore módulos não relacionados, não adicione dependências, não mude o esquema de dados e não edite pipelines de implantação.  
> **Pare e pergunte:** se faltar uma decisão sobre autenticação, compatibilidade, migração ou comportamento de erro.

Peça que a IA declare as suposições antes de editar. Se uma suposição não puder ser verificada no código ou na documentação do projeto, ela deve ser apresentada como dúvida, não como fato. O escopo reduz custo de revisão, facilita rollback e torna a origem de uma regressão mais localizável.

## 4. Critérios de aceitação são o contrato da interação

Critérios de aceitação convertem “parece bom” em condições observáveis. Eles devem cobrir o caminho normal, entradas inválidas, limites, falhas externas, autorização, persistência, desempenho relevante, compatibilidade e observabilidade. Para cada critério, associe um teste ou uma inspeção que possa produzir evidência.

Um formato prático é:

```text
Objetivo: rejeitar uma solicitação sem campo obrigatório.
Dado: usuário autenticado e payload JSON.
Quando: o campo `email` não existe.
Então: responder 400, não persistir dados, registrar o motivo sem o payload completo.
Não regressão: payload válido continua respondendo 201.
```

Peça à IA para transformar o contrato em uma matriz de casos antes de escrever a implementação. Testes unitários e de integração são exemplos concretos para o modelo, mas não são prova suficiente: um teste pode estar incompleto, testar a implementação em vez do requisito ou omitir abuso e concorrência. A revisão deve verificar se a suíte representa a intenção, não apenas se termina com sucesso.

Critérios também devem especificar a forma da entrega: arquivos modificados, diff máximo esperado, testes executados, avisos conhecidos, dependências novas e perguntas em aberto. O resultado esperado inclui transparência sobre o que não foi verificado.

## 5. Loop de trabalho com uma IA de programação

Um loop responsável tem seis etapas curtas.

### 5.1 Preparar

Leia a issue, o README, as instruções do repositório, o código relevante e os comandos de validação. Estabeleça uma linha de base: testes atuais, lint, análise estática e estado do Git. Se a base já falhar, registre as falhas antes de atribuí-las à IA.

### 5.2 Planejar

Peça uma proposta sem edição. A resposta deve listar entendimento do problema, arquivos que serão tocados, abordagem, riscos, testes e dúvidas. Compare o plano com a arquitetura real. Corrija o plano antes de autorizar código.

### 5.3 Implementar em incrementos

Autorize uma mudança pequena, com o contrato e os critérios no mesmo pedido. Prefira um patch legível a uma reescrita. Depois de cada incremento, examine o diff, rode a validação e confirme que nenhum arquivo fora do escopo foi alterado.

### 5.4 Verificar automaticamente

A sequência recomendada pelo GitHub para código gerado por IA começa por verificações funcionais: compilar ou executar, rodar testes, observar avisos e aplicar análise estática. A orientação também cita CodeQL, Dependabot e ferramentas de qualidade como mecanismos complementares [3]. Automatize lint, testes, cobertura quando pertinente, análise estática, verificação de dependências e testes de segurança no CI.

### 5.5 Revisar com julgamento humano

Depois das ferramentas, verifique intenção, arquitetura, legibilidade, manutenção, tratamento de erros, privacidade, autorização, concorrência, compatibilidade e impacto operacional. A documentação de revisão do GitHub recomenda questionar se o código resolve o problema certo, se segue os padrões do projeto e quais suposições de negócio ou de comportamento foram feitas [3]. Mudanças sensíveis exigem revisão por outra pessoa com domínio do sistema.

### 5.6 Registrar e retroalimentar

Registre o prompt ou uma síntese dele, o diff, os comandos executados, os resultados, as decisões humanas e os riscos aceitos. Se houver falha, devolva um diagnóstico verificável: “o teste X esperava Y, recebeu Z; o comportamento correto é Y; altere apenas o arquivo A; preserve o caso B”. Não envie apenas “tente novamente”. Abra uma nova conversa quando o histórico tiver ficado irrelevante ou contraditório; o GitHub recomenda manter o histórico focado na tarefa [1].

## 6. Como controlar alucinações e dependências suspeitas

Alucinação, ou confabulação, é uma saída falsa ou enganosa apresentada com aparência de autoridade. O OWASP descreve o excesso de confiança em saídas de LLM como um risco que pode causar vulnerabilidades de segurança, desinformação, problemas legais e dano reputacional. Para código, a organização destaca bibliotecas inexistentes ou maliciosas, configurações inseguras e recomendações incompatíveis com práticas seguras [5].

A prevenção é uma cadeia de verificações, não um prompt mágico:

- peça que a IA diferencie fatos observados, inferências e dúvidas;
- exija links para a documentação oficial da versão usada, mas abra e confira os links;
- confirme que cada API, opção de configuração e pacote existe no registro oficial e é compatível com a versão do projeto;
- examine mantenedores, atividade, licença e origem de toda dependência nova;
- não instale automaticamente um pacote apenas porque o nome parece plausível;
- compare a proposta com documentação primária e com código já adotado no repositório;
- use testes negativos e casos-limite para desafiar a implementação;
- trate uma resposta confiante sem evidência como uma hipótese, nunca como aprovação.

A revisão do GitHub chama atenção para pacotes alucinados, dependências suspeitas e o risco de “slopsquatting”, no qual um atacante pode explorar nomes de pacotes inventados por modelos [3]. Essa verificação deve ocorrer antes de resolver ou publicar a dependência.

Para tarefas de pesquisa ou planejamento, solicite um artefato estruturado com afirmação, fonte, versão, evidência e nível de incerteza. Para tarefas de implementação, peça um resumo das suposições e dos pontos que requerem decisão humana. Ferramentas de busca, compiladores, testes e scanners podem contradizer a IA; essa contradição é um sinal útil, não um inconveniente a ser ocultado.

## 7. Segurança de código e automação gerada

Código gerado que altera CI/CD, permissões ou segredos merece uma barreira adicional. A referência oficial do GitHub Actions recomenda o princípio do menor privilégio para `GITHUB_TOKEN`, começando com somente leitura e ampliando permissões por job apenas quando necessário [4]. Recomenda também não guardar segredos em texto puro, auditar seu uso e rotacioná-los se forem expostos.

A mesma referência afirma que ações de terceiros devem ser auditadas e, quando possível, fixadas em um SHA completo, pois uma tag pode ser movida ou apagada. Workflows que lidam com pull requests não confiáveis não devem fazer checkout de conteúdo não confiável em contexto privilegiado. CODEOWNERS pode exigir aprovação específica para mudanças em `.github/workflows`, e OpenID Connect pode substituir credenciais de nuvem de longa duração [4].

Portanto, um pedido para “corrigir o pipeline” deve incluir: evento que dispara o workflow, permissões exigidas por job, origem e versão das actions, tratamento de artefatos, exposição de segredos, runner usado e revisão obrigatória. Não aceite uma solução que apenas faz o pipeline passar, desabilita uma checagem, imprime variáveis ou amplia permissões sem justificativa.

O NIST AI RMF: Generative AI Profile apresenta a gestão de risco como parte do desenho, desenvolvimento, uso e avaliação de sistemas de IA [6]. Aplicado ao Vibe Coding, isso significa que controles precisam existir ao longo do ciclo de vida: definição do uso permitido, validação, monitoramento, documentação e correção. A ferramenta não é o responsável final pelo sistema; a organização continua responsável por estabelecer governança e critérios de confiança.

## 8. Antipadrões

**Prompt monolítico e ambíguo.** Pedir para “construir o sistema inteiro, seguro e pronto para produção” mistura descoberta, arquitetura, implementação e operação. O resultado é difícil de revisar e fácil de aceitar por aparência.

**Despejo de contexto sem hierarquia.** Anexar centenas de arquivos sem indicar quais são autoridade aumenta ruído e pode fazer a ferramenta usar código obsoleto ou exemplos irrelevantes.

**Escopo implícito.** Não declarar arquivos intocáveis, dependências proibidas e comportamentos que devem permanecer permite refatorações não solicitadas.

**Aceitar a primeira resposta.** Uma saída fluente é uma hipótese. Aceitá-la sem diff, teste, documentação e revisão transforma velocidade em risco.

**Confundir testes verdes com correção.** Testes podem estar incompletos. Excluir, marcar como `skip` ou enfraquecer um teste para obter sucesso é um sinal de falha do processo.

**Confiar no raciocínio narrado.** A explicação da IA não prova que o código funciona. Valide o artefato e as evidências observáveis.

**Instalar o pacote sugerido sem confirmar.** Nomes plausíveis podem ser inventados ou apontar para dependências não confiáveis.

**Desativar controles para “desbloquear” o CI.** Remover lint, análise de segurança, revisão de workflow ou proteção de branch para fazer uma mudança passar troca uma falha visível por risco oculto.

**Dar acesso irrestrito ao agente.** Permitir edição de produção, acesso a segredos ou execução privilegiada sem aprovação reduz a capacidade de conter uma saída incorreta ou uma instrução maliciosa.

**Feedback sem evidência.** “Está errado, tente de novo” não informa qual critério falhou e tende a produzir variações do mesmo erro.

## 9. Exercício: calibrar uma mudança pequena em três ciclos

Escolha um repositório didático ou uma cópia local sem dados sensíveis. A mudança deve ser pequena, como adicionar uma validação a um endpoint ou uma função de transformação. Não escolha autenticação, pagamento, migração destrutiva ou implantação real para o primeiro exercício.

**Ciclo 1 — linha de base.** Escreva em meia página o objetivo, o comportamento atual, os arquivos relevantes, a versão do runtime, os comandos de teste e três casos-limite. Rode os testes existentes e registre o resultado. Em seguida, envie à IA apenas um pedido deliberadamente vago, sem aplicar a saída. Anote quais perguntas a resposta deixou sem resolver.

**Ciclo 2 — calibração.** Reescreva o pedido com: objetivo, arquivos autorizados, arquivos proibidos, contrato, exemplos de entrada e saída, critérios de aceitação, não objetivos, testes esperados e instrução para declarar dúvidas. Peça primeiro um plano. Revise o plano; só então autorize um patch mínimo. Confirme o diff e execute testes, lint e análise de dependências.

**Ciclo 3 — revisão adversarial e feedback.** Peça à IA uma lista de riscos e casos não cobertos, mas trate-a como uma fonte de hipóteses. Verifique cada ponto manualmente e na documentação oficial. Introduza um caso que diferencie uma implementação correta de uma apenas plausível. Se houver falha, devolva o erro com entrada, saída observada, saída esperada e restrição de escopo. Faça uma única correção por rodada.

Entregue uma ficha com: prompt inicial e calibrado; plano aprovado; diff final; critérios de aceitação; comandos e resultados; dependências verificadas; riscos encontrados; decisões humanas; e uma reflexão sobre o que a IA acelerou e o que continuou exigindo competência de engenharia. A avaliação considera a qualidade do contexto, a redução de escopo, a cobertura dos critérios, a evidência de revisão e a capacidade de explicar riscos. Código que apenas “funciona no exemplo feliz” não atende ao exercício.

## Conclusão

Vibe Coding responsável usa a IA para reduzir o tempo entre uma intenção clara e uma hipótese implementável. A calibração converte essa hipótese em mudança limitada, testável e revisável. A velocidade de geração pode aumentar, mas a responsabilidade por requisitos, arquitetura, segurança, dependências, operação e impacto permanece humana e organizacional. O processo maduro não pergunta somente “a IA escreveu rápido?”. Pergunta “qual evidência permite aceitar esta mudança, quais riscos permanecem e quem decidiu aceitá-los?”.

## Referências

[1]: https://docs.github.com/copilot/concepts/prompt-engineering-for-copilot-chat "Prompt engineering for GitHub Copilot Chat — GitHub Docs"

[2]: https://docs.github.com/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot "Adding repository custom instructions for GitHub Copilot — GitHub Docs"

[3]: https://docs.github.com/en/copilot/tutorials/review-ai-generated-code "Review AI-generated code — GitHub Docs"

[4]: https://docs.github.com/en/actions/reference/security/secure-use "Secure use reference — GitHub Docs"

[5]: https://genai.owasp.org/llmrisk2023-24/llm09-overreliance/ "LLM09: Overreliance — OWASP GenAI Security Project"

[6]: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile — NIST"

## Fontes consultadas

Foram consultadas e lidas as seis páginas acima. As fontes [1] e [2] fundamentam contexto, instruções persistentes, decomposição e iteração; [3] fundamenta a revisão funcional, contextual, de qualidade, dependências e riscos específicos de código gerado; [4] fundamenta o tratamento seguro de workflows, tokens, segredos, actions de terceiros e conteúdo não confiável; [5] fundamenta os riscos de excesso de confiança, alucinações e pacotes inexistentes; e [6] fundamenta a perspectiva de gestão de risco e confiança ao longo do ciclo de vida de IA generativa.
