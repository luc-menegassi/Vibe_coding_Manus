# Capítulo 10 — Implementação com a IA

## Tese

A IA de programação deve ser tratada como uma ferramenta de aceleração dentro de um processo de engenharia, não como autoridade técnica nem como substituta de testes, revisão e decisão humana. Ela pode reduzir o tempo para explorar uma solução, escrever um teste ou produzir um patch pequeno. A responsabilidade por requisitos, segurança, comportamento, compatibilidade, licenças, impacto operacional e integração continua com a pessoa ou equipe que mantém o software. A velocidade de geração de código, portanto, não é evidência de correção.

O modo responsável de trabalhar é tornar cada contribuição da IA pequena, verificável e reversível. O ciclo recomendado é: explicitar o objetivo e as restrições; escolher uma mudança de baixo acoplamento; escrever ou revisar testes quando houver comportamento verificável; pedir à IA uma alteração limitada; executar os testes; inspecionar o diff; fazer uma revisão funcional e de segurança; e somente então integrar por commit ou pull request. Essa disciplina é coerente com a orientação do Git para examinar mudanças exatas antes do commit [1], com a revisão arquivo a arquivo recomendada pelo GitHub [2], com a revisão manual de segurança defendida pela OWASP [5] e com a abordagem baseada em risco do SSDF do NIST [6].

## Objetivos de aprendizagem

Ao concluir este capítulo, a pessoa em formação deverá ser capaz de:

1. Usar uma IA de programação para implementar mudanças pequenas sem transferir a ela a responsabilidade pelo resultado.
2. Escrever uma solicitação verificável, informando contexto, objetivo, restrições, interfaces e critérios de aceitação.
3. Aplicar testes primeiro quando o comportamento puder ser descrito com exemplos ou propriedades, distinguindo teste da própria especificação.
4. Ler o diff completo, incluindo mudanças staged e unstaged, e detectar alterações fora do escopo.
5. Revisar uma contribuição gerada por IA quanto a funcionalidade, segurança, dependências, tratamento de erros e efeitos operacionais.
6. Integrar a mudança com commits ou pull requests pequenos, CI reproduzível e permissões mínimas.
7. Reconhecer alucinações, código plausível porém incorreto, vazamento de dados e automações perigosas como riscos técnicos do uso de IA.

## Conceitos centrais

### 1. Velocidade de geração não é qualidade de engenharia

Um modelo pode produzir código sintaticamente válido em segundos, mas não conhece automaticamente todos os requisitos do produto, os contratos implícitos do sistema, as ameaças relevantes, os dados reais, as restrições de operação ou a política de dependências do projeto. A saída deve ser considerada uma proposta. A equipe ainda precisa justificar a solução, verificar o comportamento e assumir o risco residual.

A pergunta útil não é “a IA escreveu rápido?”, mas “qual evidência permite aceitar esta mudança?”. Evidências adequadas incluem testes que representam requisitos, inspeção do diff, análise de impacto, revisão por outra pessoa quando necessário e execução de verificações automatizadas. O NIST descreve o SSDF como um conjunto de práticas orientadas a resultados e afirma que ele deve ser adaptado ao risco, custo, viabilidade e contexto, e não aplicado como um checklist cego [6].

### 2. Contexto mínimo, escopo explícito e contrato de trabalho

Antes de pedir código, forneça à IA o problema que deve ser resolvido, os arquivos relevantes, as interfaces que não podem mudar, as restrições de segurança e desempenho, os casos de erro e o critério de aceitação. Declare também o que está fora do escopo. A ausência de contexto favorece uma solução genérica que parece razoável, mas viola decisões locais do projeto.

Uma solicitação útil separa observação de decisão: “este endpoint recebe X e hoje falha em Y” é diferente de “reescreva todo o módulo”. Peça primeiro uma leitura do problema, hipóteses e plano curto. Depois autorize um patch limitado. Se a IA fizer uma suposição, ela deve registrá-la para que a pessoa possa confirmá-la ou rejeitá-la.

### 3. Mudança pequena e reversível

Uma mudança pequena altera uma responsabilidade bem delimitada, toca poucos arquivos e tem uma forma clara de ser validada. Isso reduz o espaço de revisão e facilita a identificação da causa quando um teste falha. O tamanho da resposta da IA não deve determinar o tamanho do patch: se o modelo propõe uma refatoração ampla para corrigir uma regra simples, interrompa e reduza o pedido.

A reversibilidade também é um mecanismo de segurança. Trabalhar em branch própria, evitar misturar formatação com comportamento e fazer commits coesos tornam possível descartar a proposta sem perder trabalho não relacionado. Uma mudança que não pode ser explicada em uma frase provavelmente precisa ser dividida.

### 4. Testes primeiro quando o comportamento é especificável

“Testes primeiro” significa transformar o comportamento esperado em exemplos executáveis antes de pedir a implementação, quando isso fizer sentido. É particularmente útil para funções puras, validações, transformações de dados, regras de negócio e contratos de API. Um teste deve tornar explícitos entrada, saída ou erro esperado. A documentação oficial de `unittest` define o caso de teste como uma verificação de uma resposta específica para determinadas entradas e mostra asserções como `assertEqual`, `assertTrue`, `assertFalse` e `assertRaises` [4].

Testes não substituem a especificação. Um teste pode repetir um entendimento errado, cobrir apenas o caminho feliz ou confirmar a implementação sugerida pela própria IA. Antes de celebrar o verde, revise se os exemplos representam a intenção do produto e inclua limites, entradas inválidas, autorização, concorrência ou falhas de dependência quando forem relevantes. Quando teste primeiro não for prático, registre a razão e compense com uma verificação manual, um teste de integração ou uma prova de comportamento observável.

### 5. Diff como unidade de revisão

O diff mostra o que mudou, e não apenas que arquivos foram tocados. O Git documenta que `git diff` mostra alterações ainda não staged, enquanto `git diff --staged` ou `git diff --cached` mostra o que está preparado para o próximo commit [1]. O guia do Git também alerta que `git diff` sozinho não mostra todas as alterações desde o último commit quando parte delas já foi staged [1]. Por isso, uma revisão responsável deve olhar os dois estados, além do status e do histórico apropriado.

A revisão começa pela intenção: cada linha deve contribuir para o requisito. Depois verifica comportamento, tratamento de erros, fronteiras de confiança, dados sensíveis, compatibilidade e efeitos sobre observabilidade. O GitHub recomenda examinar os arquivos individualmente, comentar mudanças específicas e só então aprovar ou solicitar alterações [2]. Em uma contribuição gerada por IA, a revisão deve ser ainda mais cética diante de código “óbvio”, pois plausibilidade textual não demonstra que a lógica está correta.

### 6. Revisão humana e automação têm papéis diferentes

Ferramentas automatizadas são boas em repetir verificações, detectar padrões e impedir regressões conhecidas. Elas não compreendem plenamente regras de negócio, fluxos de autorização, condições de corrida ou a adequação de uma decisão arquitetural. A OWASP define a revisão segura de código como exame manual que encontra vulnerabilidades que ferramentas automatizadas podem não detectar, e descreve a revisão baseada em diff como adequada para pull requests e validação contínua [5]. A revisão humana não elimina SAST, DAST, linters, testes ou scanners de dependências; ela os complementa.

O NIST SSDF 1.1 recomenda revisar, analisar e testar o código para identificar vulnerabilidades que ainda não foram encontradas [7]. No perfil específico para IA generativa, o NIST recomenda combinação de processos automatizados com pessoa no circuito, auditorias periódicas e verificação de integridade e proveniência de componentes de IA quando aplicável [7]. Para este capítulo, a consequência prática é clara: use a IA para aumentar a capacidade de revisão, nunca para eliminar o revisor responsável.

### 7. Integração segura inclui cadeia de ferramentas

Uma mudança correta pode ser integrada de modo inseguro. Workflows de CI, scripts, dependências e ações de terceiros executam com acesso ao repositório, ao ambiente e, em alguns casos, a segredos. A documentação do GitHub recomenda o princípio do menor privilégio para o `GITHUB_TOKEN`, permissões explícitas e cuidado com segredos nos logs [3]. Ela também afirma que fixar uma ação em um SHA completo é a maneira de usar uma versão imutável da ação [3].

Ao aceitar uma alteração da IA, verifique também arquivos de configuração e automação. Não coloque tokens, dados pessoais, código proprietário ou informações de clientes no prompt sem autorização e controles adequados. Não aceite um workflow que aumente permissões apenas para “fazer o pipeline passar”. Triggers que executam código não confiável em contexto privilegiado, checkout de código de fork com acesso a segredos e ações não fixadas devem ser tratados como riscos de integração, não como detalhes de sintaxe.

## Práticas recomendadas

### Antes de pedir código

1. **Defina o resultado observável.** Escreva o comportamento desejado, os casos de erro, as interfaces preservadas e os critérios de aceitação. Inclua um exemplo mínimo de entrada e saída.
2. **Separe o pedido em uma tarefa.** Escolha uma função, um teste, uma correção ou uma alteração de configuração. Não peça “melhore o projeto inteiro”.
3. **Forneça somente o contexto necessário.** Remova segredos, dados reais e arquivos irrelevantes. Informe versões, convenções e comandos de teste que realmente existam no projeto.
4. **Peça plano e perguntas antes do patch.** Instrua a IA a declarar suposições, apontar ambiguidades e listar os arquivos que pretende alterar. Rejeite a implementação se uma suposição afetar segurança ou contrato público.
5. **Escolha um ambiente isolado.** Use uma branch de trabalho, um ambiente de desenvolvimento e permissões mínimas. Não execute comandos destrutivos sugeridos pela IA sem entender seu efeito.

### Durante a implementação

6. **Escreva ou revise os testes antes da implementação quando adequado.** Para cada requisito, crie casos de sucesso, limite e falha. Se a IA gerar testes, revise a intenção deles antes de pedir o código de produção.
7. **Peça o menor patch possível.** Instrua: “altere apenas estes arquivos; não refatore, não atualize dependências e não mude a API sem autorização”. Se surgir uma melhoria lateral, registre-a para outra tarefa.
8. **Exija explicação de decisões relevantes.** A IA deve explicar por que escolheu uma API, quais entradas considera confiáveis, como trata erros e quais riscos permanecem. A explicação não substitui a leitura do código, mas revela premissas para revisão.
9. **Execute verificações localmente.** Rode a suíte, testes de integração necessários, formatter, linter, análise estática e scanner de dependências conforme o projeto. Uma execução verde prova apenas que aquelas verificações passaram.
10. **Inspecione todos os estados do Git.** Use `git status`, `git diff` e `git diff --staged` para verificar alterações não staged e staged. Confira arquivos novos, exclusões, renomeações, lockfiles, scripts e configurações. Leia o diff em contexto, não apenas o resumo.
11. **Compare o resultado com a especificação.** Para cada critério de aceitação, registre a evidência. Procure comportamento não solicitado, mensagens de erro que exponham dados, alteração de permissões, validação ausente, consultas construídas com entrada externa, desserialização insegura, uso incorreto de criptografia e dependências desnecessárias.
12. **Faça uma revisão de segurança orientada a risco.** Priorize fronteiras de confiança, autenticação, autorização, entrada e saída, segredos, logs, uploads, comandos, SQL, templates, rede, concorrência e limites de recurso. A OWASP recomenda identificar arquivos modificados, componentes afetados, novos vetores de ataque e regressões de controles em revisões baseadas em diff [5].

### Antes de integrar

13. **Mantenha um commit coeso.** O commit deve ter uma mensagem que explique a intenção e não deve esconder uma refatoração não relacionada. Faça o commit somente depois de revisar o conteúdo staged.
14. **Use pull request para mudanças que precisam de revisão.** Explique problema, solução, riscos, testes executados e itens deliberadamente não cobertos. Revise arquivo a arquivo, com comentários específicos; aprove somente após resolver dúvidas materiais [2].
15. **Proteja a CI.** Conceda ao `GITHUB_TOKEN` apenas permissões necessárias, mantenha segredos fora de arquivos e logs e fixe ações de terceiros em SHA completo quando usar GitHub Actions [3]. Trate workflows e scripts gerados pela IA como código executável de alto impacto.
16. **Registre a participação da IA quando a política exigir.** Anote ferramenta, finalidade, arquivos afetados e verificações humanas. O objetivo não é atribuir culpa à ferramenta, mas preservar rastreabilidade e facilitar investigação de defeitos.
17. **Integre gradualmente.** Para mudanças de maior risco, use feature flag, rollout progressivo, revisão adicional ou ambiente de homologação. Se não for possível explicar como desfazer a mudança, ela não está pronta para integração.

## Anti-padrões

1. **Aceitar o primeiro patch por parecer idiomático.** Código familiar pode conter contrato errado, validação ausente ou uma suposição inventada.
2. **Pedir uma reescrita ampla para corrigir um defeito local.** O diff cresce, a revisão fica superficial e a origem de uma regressão torna-se difícil de localizar.
3. **Gerar testes depois da implementação copiando o comportamento existente.** Isso pode transformar o defeito em requisito e produzir uma suíte verde para uma solução errada.
4. **Usar somente o teste feliz como prova.** Entradas vazias, limites, falhas de dependência, autorização e concorrência frequentemente concentram o risco.
5. **Revisar apenas `git diff` ou apenas `git diff --staged`.** Um dos estados pode ocultar alterações relevantes; a revisão deve considerar o conjunto que será integrado.
6. **Aprovar pelo resumo da IA ou pelo resultado do linter.** Resumos podem omitir impacto e ferramentas automáticas não substituem entendimento do domínio e da ameaça.
7. **Permitir que a IA altere dependências, lockfiles ou workflows sem solicitação explícita.** O custo pode aparecer como vulnerabilidade, mudança de licença, execução privilegiada ou incompatibilidade de produção.
8. **Colar segredos, dados de cliente ou código restrito no prompt.** O contexto enviado ao serviço pode ser armazenado, processado ou exposto em desacordo com a política da organização.
9. **Executar comandos destrutivos sugeridos pela IA no repositório ou no ambiente.** Uma linha pode remover dados, publicar artefatos ou modificar infraestrutura antes que alguém entenda o efeito.
10. **Aumentar permissões da CI para compensar um script frágil.** O problema deve ser corrigido no script e no desenho do workflow, não resolvido com acesso amplo.
11. **Misturar autoria e responsabilidade.** Dizer que “foi a IA” não reduz a obrigação da equipe de revisar, testar, documentar e corrigir o software.
12. **Medir sucesso por linhas geradas.** Linhas produzidas, prompts feitos ou minutos economizados não demonstram valor se o risco e o retrabalho aumentarem.

## Exercício prático — patch pequeno com revisão de diff

Implemente, em um repositório Python de treinamento, uma função `parse_page_size(value)` que aceite somente inteiros entre 1 e 100, retorne um inteiro válido e produza um erro claro para entradas ausentes, não numéricas, fracionárias ou fora do intervalo. Não altere a API existente, não adicione dependências e não modifique o workflow de CI.

**Etapa 1 — contrato.** Escreva os critérios de aceitação e crie uma branch. Liste explicitamente casos como `1`, `100`, `0`, `101`, `"10"`, `"10.5"`, `None` e uma string vazia. Decida qual exceção e qual mensagem fazem parte do contrato. Não entregue dados sensíveis ao assistente.

**Etapa 2 — testes primeiro.** Crie testes independentes para valores válidos e inválidos. Em Python, execute `python -m unittest -v`. Confirme que pelo menos um teste falha antes da implementação. Se optar por `pytest`, registre a razão e mantenha o mesmo contrato. Pergunte à IA se há casos de fronteira esquecidos, mas não aceite testes sem revisar suas expectativas.

**Etapa 3 — pedido controlado à IA.** Envie um prompt semelhante a: “Analise apenas os arquivos X e Y. Não altere a API, dependências, configuração ou CI. Com base nos testes existentes, proponha o menor patch para `parse_page_size`. Antes do código, liste suposições, riscos e arquivos a modificar. Depois mostre um diff curto e os comandos de verificação”. Revise o plano antes de aplicar o patch.

**Etapa 4 — validação.** Execute os testes e o linter do repositório. Rode `git status`, `git diff` e `git diff --staged` em momentos apropriados. Verifique que somente os arquivos autorizados mudaram, que mensagens não revelam dados, que não existe conversão permissiva inesperada e que nenhuma dependência ou workflow foi alterado.

**Etapa 5 — revisão adversarial.** Peça à IA uma revisão do diff com perguntas específicas: “qual requisito este trecho atende?”, “qual entrada pode burlar a validação?”, “o tipo aceito é exatamente o contrato?”, “há mudança fora do escopo?”. Trate a resposta como uma lista de hipóteses. A pessoa revisora deve confirmar cada ponto no código e nos testes.

**Etapa 6 — integração.** Faça um commit coeso com mensagem que descreva a mudança. Simule uma pull request com resumo, testes executados, riscos residuais e arquivos alterados. Um colega ou instrutor deve aprovar somente depois de ler o diff. Como critério de conclusão, o exercício deve entregar: testes que falham antes e passam depois; diff limitado; nenhuma credencial ou dependência nova; explicação das decisões; e uma lista de riscos que permaneceriam em uma aplicação real.

O exercício ensina uma propriedade essencial: a IA pode acelerar a produção do patch, mas o artefato de engenharia é a combinação entre contrato, teste, diff revisado, evidência de execução e integração controlada.

## Referências

[1]: https://git-scm.com/docs/git-diff "git-diff Documentation"
[2]: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request "Reviewing proposed changes in a pull request"
[3]: https://docs.github.com/en/actions/reference/security/secure-use "Secure use reference"
[4]: https://docs.python.org/3/library/unittest.html "unittest — Unit testing framework"
[5]: https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html "Secure Code Review Cheat Sheet"
[6]: https://csrc.nist.gov/projects/ssdf "Secure Software Development Framework (SSDF)"
[7]: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218A.pdf "NIST SP 800-218A — Secure Software Development Practices for Generative AI and Dual-Use Foundation Models"

## Fontes consultadas

As fontes foram abertas e lidas integralmente nas seções relevantes, não apenas pelos snippets de busca. Git e GitHub fundamentam a revisão do diff e do pull request; Python fundamenta a descrição de casos, asserções e execução de testes; OWASP fundamenta a revisão manual e baseada em diff; NIST fundamenta a abordagem de desenvolvimento seguro orientada a risco e as recomendações específicas para IA generativa; e GitHub Actions fundamenta menor privilégio, proteção de segredos e pinagem de ações.

URLs completas: <https://git-scm.com/docs/git-diff>; <https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request>; <https://docs.github.com/en/actions/reference/security/secure-use>; <https://docs.python.org/3/library/unittest.html>; <https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html>; <https://csrc.nist.gov/projects/ssdf>; <https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218A.pdf>.

**Limite de evidência:** as fontes consultadas não medem uma “taxa universal” de correção de código gerado por IA. Por isso, o capítulo não afirma que a IA melhora ou piora a produtividade em termos absolutos. Ele estabelece controles de processo para que qualquer ganho de velocidade seja avaliado por evidências de correção, segurança e capacidade de reversão.
