# Capítulo 08 — Especificação

## Tese

**Vibe Coding pode reduzir o tempo entre uma intenção e um primeiro rascunho de código, mas não reduz a responsabilidade técnica de transformar uma intenção em um comportamento verificável, seguro e operável.** A velocidade de geração não é evidência de correção. Em um processo responsável, a IA participa como ferramenta de exploração e produção de rascunhos; a equipe continua responsável por delimitar o problema, registrar requisitos, decidir contratos, antecipar casos-limite, avaliar riscos e aceitar ou rejeitar as mudanças com evidências.

A especificação é o mecanismo que torna essa responsabilidade legível. Ela não precisa prever cada linha de implementação, porém deve tornar explícitos o problema a resolver, o que está fora do escopo, as condições observáveis de sucesso, as invariantes que não podem ser quebradas e os controles necessários para reduzir o risco. O NIST SSDF recomenda que requisitos de segurança sejam identificados, documentados, mantidos e verificados em pontos relevantes do ciclo de vida; a recomendação vale também para componentes de terceiros e para os processos de desenvolvimento. [1]

## Escopo deste capítulo

Este capítulo trata exclusivamente da **especificação** de uma mudança de software: requisitos funcionais e não funcionais, critérios de aceitação, casos-limite, contratos, não objetivos e definição de pronto. O foco é o trabalho de formação de uma pessoa que usa uma IA de programação sem transferir a ela a decisão técnica.

Não é objetivo deste capítulo ensinar uma linguagem, escolher uma arquitetura completa, apresentar um tutorial de framework ou substituir análise de negócio, threat modeling detalhado, revisão de código, testes ou operação. Esses temas aparecem somente na medida em que precisam ser explicitados na especificação e na definição de pronto.

## 1. O que uma boa especificação precisa tornar possível

Uma especificação útil permite que uma pessoa diferente do autor responda, sem adivinhação, às seguintes perguntas:

1. **Qual problema está sendo resolvido?** Descreva o usuário, o contexto e o resultado esperado, sem começar pela solução técnica.
2. **Qual comportamento é obrigatório?** Escreva requisitos atômicos, observáveis e verificáveis. Evite verbos vagos como “melhorar”, “otimizar” ou “ser amigável” sem uma medida ou condição.
3. **Quais propriedades não funcionais importam?** Registre, quando aplicável, segurança, privacidade, disponibilidade, desempenho, acessibilidade, compatibilidade, auditabilidade, custo e operação.
4. **O que não será feito?** Declare não objetivos para impedir que a IA preencha lacunas com funcionalidades plausíveis, mas não autorizadas.
5. **Como alguém saberá que terminou?** Relacione cada requisito a critérios de aceitação, testes ou outra evidência observável.
6. **Quais são as fronteiras entre partes?** Documente contratos de API, eventos, dados, erros, autenticação, permissões, compatibilidade e efeitos colaterais.
7. **O que acontece nos limites e nas falhas?** Especifique entradas vazias, inválidas, grandes demais, repetidas, concorrentes ou atrasadas, além de indisponibilidade e falhas parciais.

A especificação não é um pedido genérico à IA, como “implemente um cadastro robusto”. É um acordo verificável sobre comportamento e limites. Quando faltam requisitos, a IA tende a completar o contexto com padrões prováveis. Isso pode acelerar um protótipo, mas também introduzir decisões de produto, segurança ou compatibilidade que ninguém aprovou.

## 2. Requisitos: do desejo à condição verificável

### 2.1 Requisitos funcionais

Um requisito funcional deve expressar uma capacidade ou regra de negócio. Uma forma prática é usar identificadores estáveis, por exemplo `REQ-F-01`, e escrever uma condição no formato:

> **Quando** [ator ou evento] ocorrer em [contexto], o sistema **deve** [resultado observável], respeitando [regra ou restrição].

Exemplo: “Quando uma pessoa autenticada solicitar a própria lista de tarefas, o serviço deve retornar somente tarefas pertencentes a essa pessoa, ordenadas por `created_at` decrescente.” O requisito contém ator, autorização, escopo dos dados, ordenação e resultado. Ele é mais útil para a IA e para o revisor do que “criar endpoint de tarefas”.

Requisitos devem ser pequenos o bastante para que uma falha tenha causa identificável. Se uma frase contém vários comportamentos independentes, divida-a e indique dependências. Priorize-os, por exemplo, como obrigatório, importante ou posterior. A prioridade não elimina os requisitos de segurança: uma regra de autorização não vira opcional porque a funcionalidade é um protótipo.

### 2.2 Requisitos não funcionais

Requisitos não funcionais também precisam de uma condição de verificação. “Baixa latência” pode ser substituído por “p95 inferior a 300 ms para 100 requisições por segundo no ambiente de teste definido”. “Seguro” precisa apontar controles e evidências: “o servidor rejeita objetos de outro usuário com resposta uniforme e o teste de autorização negativo passa”.

Para software que processa dados ou expõe uma API, registre pelo menos:

- autenticação e autorização, incluindo o princípio de menor privilégio;
- confidencialidade, retenção e exposição de dados sensíveis;
- limites de tamanho, taxa, tempo de espera e paginação;
- tratamento de erros sem vazamento de segredos ou detalhes internos;
- compatibilidade de versões e comportamento de migrações;
- logs, métricas, rastreabilidade e sinais de falha;
- acessibilidade e internacionalização quando fizerem parte do produto.

O NIST SSDF vincula requisitos de segurança a políticas, arquitetura, stacks tecnológicos, componentes de terceiros e pontos de verificação no ciclo de vida. [1] A especificação deve refletir essa abordagem: não basta dizer que a IA deve “seguir boas práticas”; é necessário declarar quais propriedades serão verificadas e qual exceção, se houver, foi aprovada, por quem e até quando.

### 2.3 Requisitos de segurança e risco

Requisitos de segurança devem ser derivados do contexto de ameaça e do impacto de uma falha. Para uma mudança que manipula identidade, dinheiro, dados pessoais, arquivos ou comandos, inclua uma análise proporcional de superfície de ataque, dados protegidos e fronteiras de confiança. O NIST SSDF recomenda modelagem de ameaças, ataque ou superfície de ataque para avaliar riscos e decidir mitigações. [1]

A OWASP ASVS é uma fonte útil para converter controles de aplicações em requisitos testáveis. O projeto declara que o ASVS serve como base para testar controles técnicos e como lista de requisitos de desenvolvimento seguro; também recomenda identificadores versionados para que um requisito continue rastreável quando o padrão mudar. [2] Não é preciso copiar o ASVS inteiro para toda mudança. Selecione os requisitos pertinentes, registre a versão e explique a escolha.

## 3. Critérios de aceitação

Critérios de aceitação são condições que permitem aceitar ou rejeitar o comportamento implementado. Eles não são uma repetição da implementação. Devem descrever resultados que uma pessoa usuária ou um sistema externo consiga observar.

O Gherkin organiza cenários com `Given` para o estado inicial, `When` para a ação ou evento e `Then` para o resultado esperado. A documentação do Cucumber recomenda que o `Then` verifique um resultado observável, em vez de depender de detalhes internos como uma linha específica no banco de dados. [3]

Exemplo de critério:

```gherkin
Cenário: listar somente tarefas da pessoa autenticada
  Dado que Ana está autenticada
  E existem duas tarefas de Ana e uma tarefa de Bruno
  Quando Ana solicita sua lista de tarefas
  Então a resposta tem status 200
  E contém somente as duas tarefas de Ana
  E a lista está ordenada por data de criação decrescente
```

Escreva critérios que sejam independentes da solução quando possível. “Usa a função `filterTasksByUser`” não é critério de aceitação; “não retorna tarefas de outra pessoa” é. Uma implementação pode mudar sem invalidar o requisito.

Para reduzir ambiguidade, cada critério deve responder a quatro pontos: pré-condição, estímulo, resultado observável e regra de falha. Inclua exemplos de dados representativos, mas não confunda um exemplo com a especificação completa. Quando o mesmo comportamento deve funcionar para combinações diferentes de valores, use uma tabela de exemplos ou um `Scenario Outline`. O Gherkin executa o cenário-modelo uma vez por linha de exemplos, o que torna limites e variações explícitos. [3]

## 4. Casos-limite e falhas esperadas

Casos-limite não são uma lista infinita de entradas estranhas. Eles são uma seleção baseada no risco e nas fronteiras do contrato. Para cada entrada ou condição relevante, especifique o resultado esperado, o código de erro, a mensagem segura e se a operação deve ser idempotente ou reversível.

Uma matriz inicial para uma API ou serviço pode incluir:

| Dimensão | Perguntas a responder |
| --- | --- |
| Presença | O que acontece com campo ausente, `null`, string vazia e valor padrão? |
| Tamanho | Quais são os mínimos e máximos de strings, listas, arquivos e payloads? O que ocorre acima do limite? |
| Tipo e formato | Como o serviço trata tipo incorreto, número não finito, data inválida, Unicode não normalizado ou enum desconhecido? |
| Faixa e semântica | Valores negativos, zero, máximo permitido, datas invertidas e combinações incompatíveis são aceitos? |
| Autorização | O que ocorre quando o recurso existe, mas pertence a outra pessoa? E quando o chamador não tem o papel necessário? |
| Repetição | O mesmo pedido pode ser repetido? Há chave de idempotência, deduplicação ou risco de cobrança duplicada? |
| Concorrência | O que ocorre em atualizações simultâneas, versão antiga, conflito ou reordenação de eventos? |
| Falhas | Como o sistema responde a timeout, dependência indisponível, resposta parcial, retry e cancelamento? |
| Observabilidade | Quais eventos devem ser registrados sem armazenar senha, token ou dado sensível? |

A OWASP recomenda validação sintática e semântica, limites mínimos e máximos e validação no servidor antes do processamento. Ela favorece allowlist para definir o conjunto autorizado, em vez de confiar apenas em uma denylist de padrões perigosos; validação no cliente pode melhorar a experiência, mas não substitui a validação no servidor. [4] Esses princípios devem aparecer no contrato e nos critérios, e não apenas em uma instrução vaga para a IA.

Um caso-limite deve ser testado no nível apropriado. A validação de `maxLength` pode ser unitária e de contrato; a proteção contra acesso a recurso de outra pessoa precisa de um teste de integração ou de autorização; um timeout de serviço externo pode exigir teste de contrato e teste de resiliência. A especificação deve indicar a evidência esperada, não prescrever um teste inadequado apenas para produzir cobertura.

## 5. Contratos: fronteiras que não devem ser adivinhadas

### 5.1 Contrato externo

Para HTTP, uma descrição OpenAPI pode funcionar como contrato compartilhado entre consumidores, implementadores, testes e ferramentas. A especificação OpenAPI define uma descrição de interface independente de linguagem para que pessoas e máquinas descubram as capacidades de uma API sem acessar o código-fonte ou inspecionar o tráfego. [5]

Um contrato de endpoint deve definir, no mínimo:

- método, caminho, propósito e operação idempotente ou não;
- parâmetros, localização, tipo, obrigatoriedade, formato e limites;
- corpo de requisição e seu schema, incluindo nulabilidade e exemplos;
- respostas de sucesso e de erro, com status, headers e schema;
- autenticação, autorização e escopos necessários;
- paginação, ordenação, filtros e limites de taxa;
- comportamento de repetição, timeout e correlação;
- política de compatibilidade e versionamento.

Não trate a existência de um arquivo OpenAPI como prova de conformidade. O contrato precisa ser validado contra a implementação e exercitado com casos positivos e negativos. A própria especificação OpenAPI descreve esquemas de segurança, como API key, HTTP auth, OAuth2, OpenID Connect e mTLS, mas a escolha e o correto funcionamento do controle dependem do sistema. [5]

### 5.2 Contratos internos e de dados

Mesmo sem uma API pública, declare pré-condições, pós-condições, invariantes e efeitos colaterais. Por exemplo: “a função recebe uma lista não nula de itens com identificador único; devolve um resultado ordenado; não altera a lista de entrada; falha sem gravar parcialmente”. Para eventos, declare nome, versão, produtor, consumidor, campos obrigatórios, semântica de entrega e compatibilidade.

Contratos de dados devem explicitar unidade, fuso horário, precisão, codificação, identificadores e política de migração. Se `created_at` é UTC, escreva isso. Se um campo pode ser ausente, diferencie ausência de `null`. Se uma alteração quebra consumidores, defina uma nova versão ou um plano de compatibilidade. A IA não deve inferir essas decisões de nomes de campos.

### 5.3 Contrato de integração e entrega

A entrega também possui contratos: quais comandos devem passar, quais artefatos serão publicados, quem pode aprovar, quais ambientes são usados e quais evidências ficam registradas. No GitHub, status checks representam validações como build, testes, varredura de código ou deploy; quando são obrigatórios em uma branch protegida, precisam passar antes do merge. [6] Isso transforma parte da definição de pronto em um gate verificável, embora um check verde não prove sozinho que o requisito foi bem especificado.

Workflows são código executável e devem entrar na revisão. A documentação do GitHub recomenda menor privilégio para `GITHUB_TOKEN`, cuidado com secrets, mitigação de injeção de scripts, auditoria de logs e cautela com ações de terceiros e runners auto-hospedados. [7] Uma especificação que pede “adicione CI” deve dizer quais permissões são necessárias, quais entradas são não confiáveis, quais ações são aprovadas e que evidência bloqueia o merge.

## 6. Como trabalhar com uma IA de programação

O trabalho responsável é um ciclo de especificação, geração, verificação e decisão humana:

1. **Delimite o pedido.** Forneça contexto mínimo suficiente, arquivos relevantes, versão de linguagem e framework, requisito, não objetivos, invariantes, contrato existente e restrições. Não envie segredos nem contexto irrelevante.
2. **Peça compreensão antes de código.** Solicite que a IA reescreva o problema, liste suposições, identifique ambiguidades e proponha perguntas. Corrija a especificação antes de aceitar qualquer patch.
3. **Peça uma proposta testável.** Solicite requisitos numerados, critérios de aceitação, casos-limite, riscos e testes. A IA pode encontrar lacunas, mas não decide sozinha quais riscos a organização aceita.
4. **Congele o contrato.** Defina ou atualize OpenAPI, schema, evento, precondições e respostas antes de gerar grandes trechos. Peça à IA para apontar incompatibilidades com o contrato.
5. **Gere em mudanças pequenas.** Prefira um diff limitado a uma reescrita ampla. Peça explicação de cada arquivo alterado, dependência adicionada, efeito colateral, migração e comando executado.
6. **Faça a IA tentar quebrar a própria proposta.** Peça casos de teste para entrada inválida, ausência de autorização, repetição, concorrência, timeout, payload grande e dependência indisponível. Compare a resposta com o modelo de ameaça e os critérios.
7. **Verifique fora da conversa.** Execute testes, lint, análise estática, validação de schema, verificações de dependências e testes de integração no ambiente apropriado. Leia o diff e os logs. Um texto convincente não é evidência.
8. **Revise segurança e procedência.** Procure segredos, comandos destrutivos, chamadas externas inesperadas, SQL ou shell inseguro, permissões excessivas, dependências não justificadas e possível código coincidente com material público. A documentação do Copilot alerta que sugestões podem ser inexatas, vulneráveis ou coincidir com código público; recomenda revisão, testes, verificação de vulnerabilidades e supervisão humana. [8]
9. **Decida e registre.** A pessoa responsável aprova, solicita alterações ou registra uma exceção com justificativa, risco, mitigação, proprietário e prazo de revisão. A IA não é aprovadora nem autoridade para aceitar risco.

Um prompt útil não diz apenas “implemente”. Ele pode seguir esta forma: “Você é revisora de uma mudança. Com base no requisito `REQ-F-01`, no contrato abaixo e nos não objetivos, liste ambiguidades e suposições. Depois escreva critérios Given/When/Then observáveis, uma matriz de casos-limite, testes negativos e riscos de segurança. Não altere o contrato nem gere código até que as lacunas estejam explícitas.”

## 7. Não objetivos

Os não objetivos protegem o escopo e impedem que velocidade de geração seja confundida com autorização para expandir o produto. Uma especificação deve declarar, quando pertinente:

- não haverá alteração de autenticação, autorização ou modelo de dados fora do que foi explicitamente aprovado;
- não haverá compatibilidade com versões antigas sem critério definido;
- não haverá suporte a novos formatos, idiomas, regiões ou integrações nesta entrega;
- não haverá aumento de permissões, segredos, runners ou serviços externos sem revisão;
- não serão corrigidos problemas não relacionados encontrados incidentalmente, salvo risco crítico documentado;
- não haverá promessa de disponibilidade, desempenho ou segurança sem métrica, ambiente e evidência;
- não será tratado como concluído um código que apenas compila ou passa por um caminho feliz;
- não se pretende que a IA substitua descoberta de requisitos, revisão humana, análise de risco, testes ou decisão de release.

Um não objetivo não autoriza ignorar riscos descobertos. Ele limita a funcionalidade planejada. Se a mudança expõe um risco crítico, a equipe deve interromper, mitigar ou registrar uma decisão consciente; não pode esconder o risco sob o rótulo de “fora do escopo”.

## 8. Definição de pronto

A definição de pronto deve ser uma lista curta de condições obrigatórias e evidências, adaptada ao risco. Para este capítulo, uma mudança só está pronta para aceitação quando:

1. o problema, o usuário, o escopo, os não objetivos, as premissas e as prioridades estão documentados;
2. os requisitos têm identificadores e critérios de aceitação observáveis;
3. o contrato externo ou interno foi criado ou atualizado, incluindo sucesso, erros, limites, autorização, compatibilidade e exemplos;
4. os casos-limite relevantes têm comportamento esperado e testes ou evidência equivalente;
5. os requisitos de segurança e privacidade foram derivados do risco, e exceções estão justificadas, aprovadas e têm prazo;
6. a implementação atende ao contrato sem efeitos colaterais não documentados;
7. testes unitários, integração, contrato e segurança aplicáveis passaram, incluindo caminhos negativos;
8. lint, análise estática, validação de dependências e verificações de CI aplicáveis passaram sem falhas críticas não aceitas;
9. não há segredos, credenciais, permissões ou chamadas externas introduzidos sem revisão;
10. a mudança foi revisada por uma pessoa que entende o domínio e pode explicar o diff, as suposições e os riscos;
11. documentação operacional, migração, observabilidade, rollback e compatibilidade foram atualizados quando aplicável;
12. o pull request contém links para os resultados dos checks e para a evidência de cada critério de aceitação.

A definição de pronto é uma barreira de decisão, não uma coleção de palavras de incentivo. Um status “success” confirma que um check específico passou; não confirma que o requisito correto foi escrito, que o caso-limite certo foi incluído ou que o sistema é adequado ao negócio. Por isso, o gate automático deve ser combinado com revisão humana e evidência rastreável.

## 9. Exercício de formação

**Objetivo:** especificar, com apoio controlado de IA, um endpoint `POST /v1/invitations` que convida uma pessoa para um espaço de trabalho.

**Contexto fixo:** a pessoa chamadora está autenticada. Ela só pode convidar alguém para um espaço ao qual pertence com o papel `owner`. O e-mail deve ser normalizado sem apagar informação válida. Um convite pendente existente para o mesmo espaço e e-mail não pode gerar duplicidade. O serviço não deve revelar, para um chamador sem autorização, se um espaço existe.

**Entregáveis da pessoa estudante:**

1. Escreva os requisitos `REQ-F-01` a `REQ-F-04` e pelo menos três requisitos não funcionais mensuráveis.
2. Declare pelo menos cinco não objetivos.
3. Escreva um contrato OpenAPI para o endpoint com request, resposta de sucesso, erros `400`, `401`, `403`, `404` ou resposta uniforme escolhida, `409` se aplicável, autenticação e limites do e-mail.
4. Produza critérios Given/When/Then para sucesso, papel insuficiente, e-mail inválido, duplicidade, espaço inexistente ou não autorizado e falha do provedor de e-mail.
5. Monte uma tabela de casos-limite: e-mail vazio, máximo de caracteres, Unicode, caixa alta, repetição concorrente, timeout, retry e provedor indisponível.
6. Peça à IA primeiro uma revisão de ambiguidades e suposições. Só depois peça um patch pequeno e testes. Inclua no prompt a instrução para não inventar campos, não alterar autorização e não usar segredos reais.
7. Revise o diff gerado e classifique cada observação em requisito, contrato, teste, risco ou não objetivo. Execute os testes negativos e registre evidências.
8. Finalize com uma definição de pronto marcada como satisfeita, não satisfeita ou não aplicável, sempre com justificativa.

**Rúbrica:** a especificação vale mais pela verificabilidade do que pela extensão. A avaliação deve procurar: requisitos sem ambiguidade; critérios observáveis; tratamento de autorização e enumeração de recursos; limites e idempotência; contrato coerente com os cenários; testes negativos; prompt com contexto e não objetivos; revisão humana explícita; e ausência de alegações de segurança que não tenham evidência.

## Conclusão

Especificar antes de gerar código é uma forma de acelerar com controle. A IA pode ajudar a revelar ambiguidades, propor exemplos, produzir variações de testes e transformar uma decisão já tomada em um diff. Ela não conhece automaticamente o impacto do negócio, o risco aceitável, a fronteira de autorização, a obrigação regulatória ou a intenção que o autor não escreveu. A equipe deve converter intenção em contrato, contrato em critérios, critérios em evidências e evidências em uma decisão responsável de pronto.

## Referências

[1]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218, Secure Software Development Framework (SSDF) Version 1.1"

[2]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard (ASVS)"

[3]: https://cucumber.io/docs/gherkin/reference/ "Cucumber Gherkin Reference"

[4]: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html "OWASP Input Validation Cheat Sheet"

[5]: https://spec.openapis.org/oas/v3.1.1.html "OpenAPI Specification v3.1.1"

[6]: https://docs.github.com/en/pull-requests/reference/status-checks "GitHub Docs: Status checks"

[7]: https://docs.github.com/en/actions/reference/security/secure-use "GitHub Docs: Secure use reference"

[8]: https://docs.github.com/en/copilot/responsible-use/chat "GitHub Docs: Responsible use of Copilot Chat"

[9]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule "GitHub Docs: Managing a branch protection rule"

Todas as páginas acima foram abertas e lidas durante a pesquisa. As recomendações foram sintetizadas para o escopo de especificação e não constituem certificação de conformidade ou garantia de segurança.
