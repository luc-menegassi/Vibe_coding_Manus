# Capítulo 09 — Planejamento

## Tese

No Vibe Coding responsável, planejar é transformar uma intenção em incrementos pequenos, verificáveis e reversíveis. A IA pode acelerar a exploração, a escrita de testes e a geração de código, mas não decide sozinha o que é valor, qual risco é aceitável ou quando uma mudança está pronta para produção. A unidade de progresso deve ser uma **fatia vertical**: uma mudança de comportamento que atravessa as camadas necessárias e pode ser demonstrada ao usuário, ainda que seja mínima. O plano deve ordenar essas fatias por valor, risco e dependências; estimá-las como hipóteses; e instalar checkpoints humanos e automatizados antes de cada avanço.

Essa abordagem diferencia **velocidade de geração** de **responsabilidade técnica**. Código produzido rapidamente continua sujeito a requisitos incompletos, falhas de lógica, vulnerabilidades, dependências frágeis e decisões arquiteturais difíceis de reverter. Portanto, o ganho legítimo do Vibe Coding é reduzir o tempo entre hipótese e evidência, não eliminar análise, revisão, testes ou prestação de contas.

## Objetivos de aprendizagem

Ao concluir este capítulo, a pessoa deverá ser capaz de:

1. Converter uma funcionalidade ampla em fatias verticais pequenas, demonstráveis e ordenáveis.
2. Definir uma ordem de implementação que considere valor, dependências, incerteza e risco técnico, em vez de apenas camadas do sistema.
3. Produzir estimativas úteis para decisões, explicitando premissas e incerteza sem tratá-las como promessas.
4. Planejar checkpoints de especificação, execução local, testes, revisão humana, CI e release.
5. Trabalhar com uma IA de programação em ciclos curtos, com contexto controlado, critérios de aceitação e evidências verificáveis.
6. Reconhecer que uma resposta plausível da IA não é prova de correção, segurança, compatibilidade ou adequação ao domínio.

## 1. Fatiamento vertical: planeje comportamento, não camadas

Uma fatia vertical atravessa as camadas necessárias para entregar um comportamento observável. Em uma aplicação web, por exemplo, uma fatia pode incluir uma tela ou endpoint, validação, regra de negócio, persistência e um teste de aceitação. Ela não precisa conter toda a capacidade final; precisa entregar um resultado coerente e verificável para um caso delimitado.

O contraste é o fatiamento horizontal: primeiro todo o banco, depois toda a API e por fim toda a interface. Esse modelo pode deixar muito código sem caminho demonstrável até o usuário e adiar a descoberta de incompatibilidades entre camadas. A experiência publicada pela Agile Alliance descreve histórias verticais como itens que incluem interface e lógica de backend, em oposição a fatias por camada arquitetural. O mesmo relato mostra que uma funcionalidade complexa pode começar pelo fluxo simples e receber validações, notificações e alternativas em incrementos posteriores [1].

Uma boa fatia tem cinco propriedades:

- **Valor observável:** alguém consegue dizer que comportamento novo ficou disponível.
- **Coerência ponta a ponta:** as camadas incluídas formam um caminho executável; não é apenas um modelo, uma tabela ou uma tela isolada.
- **Critério de aceitação:** há exemplos de entrada, resultado esperado e condições de erro relevantes.
- **Tamanho limitado:** cabe em um ciclo curto de trabalho e em uma revisão compreensível.
- **Reversibilidade:** se a hipótese estiver errada, é possível desativar, reverter ou substituir a fatia sem descartar o sistema inteiro.

Isso não significa que toda tarefa técnica deva ser exposta como história de usuário. Uma migração, uma prova de conceito ou uma tarefa de infraestrutura pode ser necessária. A regra de planejamento é que ela seja ligada a uma fatia de valor ou a uma redução de risco claramente identificada, com saída verificável.

### Como fatiar uma funcionalidade

1. **Escreva o resultado desejado:** quem precisa fazer o quê e com qual resultado.
2. **Delimite um cenário principal:** escolha o menor fluxo realista que permita demonstrar valor.
3. **Mapeie o caminho técnico:** entrada, autorização, regra de negócio, armazenamento ou serviço externo, saída e observabilidade.
4. **Separe variações por comportamento:** validações, estados de erro, permissões, notificações e otimizações podem ser fatias posteriores quando isso não comprometer segurança ou integridade.
5. **Preserve invariantes desde a primeira fatia:** autenticação, autorização, validação de entrada, transações e tratamento de falhas não são “acabamento” quando protegem dados ou dinheiro.
6. **Defina a evidência:** teste automatizado, demonstração, log, métrica ou verificação manual que provará a conclusão.

O “happy path” é útil para reduzir escopo, mas não autoriza lançar uma rota insegura. Se uma validação evita injeção, escalada de privilégio ou corrupção de estado, ela pertence à primeira fatia segura, mesmo que outras mensagens de UX possam esperar.

## 2. Ordem de implementação: valor, risco e dependências

A ordem não deve ser “frontend primeiro” ou “banco primeiro” por hábito. Deve maximizar aprendizado e reduzir custo de erro. Para cada fatia, registre:

- valor ou hipótese de negócio que será testada;
- dependências externas e internas;
- incertezas de domínio, dados, tecnologia e operação;
- impacto de falha e exposição de segurança;
- esforço relativo e tamanho da revisão;
- estratégia de lançamento, desligamento e rollback;
- evidência que autoriza avançar.

Uma ordem prática começa por uma **fatia mínima segura** que prova o caminho ponta a ponta. Em seguida, prioriza-se aquilo que reduz incerteza ou desbloqueia outras fatias. Depois entram casos de negócio de maior valor e, por fim, melhorias de abrangência, ergonomia e desempenho que não mudam a hipótese central. Riscos altos devem ser antecipados, não empurrados para o fim: uma integração com identidade, pagamento, dados pessoais ou sistema legado merece uma fatia de descoberta ou um experimento controlado antes de várias fatias dependentes.

Uma sequência genérica é:

1. **Contrato e limite:** objetivo, não objetivos, dados sensíveis, atores, permissões e critérios de aceite.
2. **Espinha vertical:** fluxo mínimo seguro com teste de aceitação e caminho de execução local.
3. **Risco dominante:** experimento ou fatia que valida a dependência mais incerta, como uma API, migração ou regra de autorização.
4. **Regras críticas:** validações, autorização por objeto, idempotência, transação e tratamento de falhas.
5. **Variações de negócio:** estados alternativos, notificações e integrações adicionais.
6. **Operação:** logs sem segredos, métricas, alertas, documentação de execução e rollback.
7. **Otimização e polimento:** desempenho, acessibilidade, UX e redução de dívida, priorizados por evidência.

Feature flags podem separar implantação de lançamento: o código pode chegar a um ambiente sem estar habilitado para todos os usuários. A fonte da Agile Alliance descreve essa separação como uma forma de testar e liberar gradualmente; o custo é manter a flag, seu dono, expiração e caminho de remoção [1]. Não use flags para esconder uma mudança que não possui teste, autorização ou plano de reversão.

## 3. Estimativas: instrumentos para decidir, não promessas

Uma estimativa só vale o custo se informar uma decisão significativa, como escolher entre duas iniciativas, alinhar dependências ou decidir se uma fatia é grande demais. Essa é a tese de Martin Fowler: estimativas ajudam quando apoiam decisões relevantes, mas podem causar dano quando viram metas rígidas ou incentivam sacrificar qualidade [2].

Estime fatias, não o produto inteiro com falsa precisão. Use uma escala relativa simples, como 1, 2, 3 e 5, onde o número representa uma combinação contextual de esforço, complexidade e incerteza. O número não é horas e não deve ser comparado entre equipes. Se uma fatia recebe 5, trate-a como sinal para investigar, dividir ou criar uma fatia de descoberta. A experiência da Agile Alliance relata justamente uma estratégia de valores 1, 2 e 3, com divisão de histórias maiores e refinamento anterior ao planejamento [1].

Para cada estimativa, registre a premissa e a faixa:

| Campo | Pergunta de controle |
|---|---|
| Tamanho relativo | É menor, semelhante ou maior que uma fatia de referência? |
| Incerteza | O que ainda não sabemos sobre domínio, integração ou tecnologia? |
| Risco | O que pode causar dano, indisponibilidade, vazamento ou retrabalho caro? |
| Dependência | Que trabalho precisa existir antes e quem precisa fornecer algo? |
| Evidência | Qual teste ou experimento reduzirá a incerteza? |
| Reestimativa | Qual evento fará a estimativa ser revisada? |

Para comunicação, prefira “a fatia cabe provavelmente em um ciclo curto, se a API X estiver disponível; ainda há risco Y” a “termina em 8 horas”. Se for necessário projetar uma data, apresente cenário otimista, provável e pessimista, as premissas e o que ficará fora. Atualize a previsão depois de cada fatia concluída. Não converta a velocidade de geração de código da IA em capacidade de entrega: revisão, testes, integração, documentação, correção e operação fazem parte do trabalho.

## 4. Riscos específicos ao planejar com IA

A IA introduz riscos próprios e amplifica riscos comuns de planejamento:

- **Especificação ilusória:** um prompt bem escrito pode esconder requisitos não decididos. Faça a IA devolver perguntas, premissas e critérios de aceitação antes de pedir código.
- **Confiança indevida:** a resposta pode parecer completa e compilar, mas ignorar regra de negócio, autorização, concorrência, migração ou observabilidade.
- **Escopo expansivo:** a IA tende a “melhorar” arquivos não solicitados. Restrinja o pedido a uma fatia e exija lista de arquivos alterados.
- **Dependências e APIs inventadas:** peça confirmação na documentação oficial, versão instalada e exemplos executáveis. Nunca aceite uma biblioteca ou opção apenas porque a resposta a citou.
- **Segredos e dados sensíveis no contexto:** não cole tokens, dados pessoais, código proprietário sem autorização ou dumps de produção. Redija o contexto e use dados sintéticos.
- **Vulnerabilidades plausíveis:** código gerado pode usar validação incompleta, autorização apenas na interface, consultas inseguras, logs com dados sensíveis ou dependências vulneráveis.
- **Mudanças difíceis de revisar:** uma resposta grande mistura refatoração, funcionalidade e formatação. Prefira commits pequenos e diff-based review.
- **Licença e proveniência:** trechos sugeridos podem ter origem desconhecida. Verifique políticas de dependência, licença e atribuição antes de incorporar.
- **Reversão incompleta:** uma migração ou mudança de contrato pode ser irreversível. Planeje compatibilidade, backup, rollback e ordem de implantação.
- **Automação com privilégio excessivo:** comandos sugeridos pela IA podem apagar dados, publicar artefatos ou expor credenciais. Execute em ambiente isolado e revise cada comando.

O SSDF do NIST recomenda integrar práticas de segurança ao ciclo de desenvolvimento, com vocabulário comum para reduzir vulnerabilidades e o impacto das não detectadas [3]. A OWASP ressalta que revisão manual complementa SAST e DAST porque lógica de negócio, autorização complexa, condições de corrida e falhas dependentes de contexto frequentemente exigem julgamento humano [4]. Assim, ferramentas automáticas são checkpoints importantes, mas não são a aprovação técnica.

## 5. Checkpoints e plano executável para a IA

Um plano para a IA deve ser operacional, não um pedido genérico de “implemente a feature”. Use ciclos curtos e interrompíveis.

### Checkpoint 0 — contrato de trabalho

Antes do primeiro código, forneça à IA o objetivo, o que está fora do escopo, stack e versões, estrutura relevante do repositório, restrições de segurança, comandos de teste e definição de pronto. Peça que ela responda com: entendimento, perguntas, suposições, riscos, arquivos candidatos e plano de fatias. O humano corrige o plano antes da execução.

### Checkpoint 1 — baseline reproduzível

Peça para identificar o branch e o estado do repositório, executar os testes existentes sem alterar código, registrar falhas prévias e propor um branch de trabalho. O Git representa versões como commits e permite linhas paralelas de desenvolvimento por branches; commits lógicos e pequenos tornam a mudança revisável e facilitam localizar regressões [5]. Nunca deixe a IA trabalhar sobre um estado sujo sem registrar o que já existia.

### Checkpoint 2 — fatia e contrato verificável

Para uma única fatia, peça primeiro critérios de aceitação em exemplos, casos de erro, permissões e dados de teste. Depois peça um teste que falhe ou uma especificação executável. Só então autorize a implementação mínima. A IA deve declarar quais arquivos pretende tocar e quais decisões não pode inferir.

### Checkpoint 3 — implementação mínima

Solicite uma alteração pequena, sem refatorações oportunistas. Exija diff, testes adicionados, comandos executados e limitações conhecidas. Se a mudança atravessar mais camadas do que o previsto, pare e replaneje em vez de aumentar silenciosamente o escopo.

### Checkpoint 4 — verificação local e revisão humana

Execute formatador, lint, testes unitários e de integração, teste de aceitação da fatia e, quando aplicável, análise de dependências e segurança. Leia o diff como código de produção: fluxos de erro, autorização no servidor, validação de entradas, transações, logs, concorrência e compatibilidade. O revisor não deve perguntar apenas “funciona?”, mas também “para quem funciona, com quais dados e sob quais falhas?”.

### Checkpoint 5 — CI e pull request

Abra um pull request por fatia ou por conjunto coeso. O GitHub documenta CI como a prática de fazer commits frequentes e construir/testar continuamente, incluindo lint, segurança, cobertura e testes funcionais [6]. Um workflow pode ser acionado por `push` ou `pull_request`, organizar jobs e restringir permissões do `GITHUB_TOKEN`; a documentação oficial recomenda configurar esses elementos no YAML do repositório [7]. Um pipeline mínimo deve instalar versões fixas, executar testes e falhar de modo visível. O resultado da CI é evidência necessária, não prova de adequação de negócio.

### Checkpoint 6 — decisão de release

Registre a decisão: liberar, liberar gradualmente, manter atrás de flag ou voltar atrás. Confira migrações, monitoramento, suporte, plano de rollback e quem aprova. Depois do release, observe erros, latência e comportamento da hipótese. Feche ou atualize a flag e reestime as próximas fatias com base no que foi aprendido.

### Prompt operacional recomendado

> Contexto: [objetivo, stack, versões, arquivos relevantes e comandos].
>
> Fatia: [um comportamento observável]. Fora do escopo: [lista].
>
> Responda primeiro com critérios de aceitação, perguntas, premissas, riscos, arquivos que pretende alterar e plano de verificação. Não escreva código ainda.
>
> Após minha aprovação, altere somente o necessário para esta fatia. Preserve APIs e comportamento não relacionado. Adicione ou atualize testes. Ao terminar, mostre o resumo do diff, testes executados com resultados, dependências introduzidas, riscos residuais e como reverter.

Esse formato transforma a IA em uma ferramenta de exploração e implementação sob supervisão. A pessoa responsável continua decidindo escopo, aceitabilidade do risco, interpretação do domínio, revisão do diff e autorização de release.

## 6. Plano de uma fatia em um ciclo curto

| Etapa | Saída | Gate para avançar |
|---|---|---|
| Descoberta | objetivo, fora do escopo, atores, riscos e perguntas | responsável confirma a hipótese |
| Refinamento | fatia vertical, critérios de aceite e dados de teste | cabe em uma revisão; dependências conhecidas |
| Preparação | branch, baseline, comando reproduzível e plano da IA | testes prévios registrados |
| Implementação | código mínimo e testes | diff limitado ao escopo |
| Verificação | resultados locais, análise de segurança e revisão manual | nenhuma falha crítica aberta |
| Integração | CI verde e pull request aprovado | checks obrigatórios passam |
| Release | flag/configuração, observabilidade e rollback | dono e janela definidos |
| Aprendizado | métricas, incidentes, decisão sobre próxima fatia | backlog e estimativas atualizados |

## Anti-padrões

### “Construa o produto inteiro” em um único prompt

Esse pedido remove fronteiras, produz diffs grandes e impede validar premissas. Substitua por uma fatia, um contrato e um checkpoint.

### Fatiar por camada e chamar isso de progresso

Uma tela sem regra, uma API sem fluxo ou uma tabela sem comportamento não prova valor. Relacione tarefas técnicas a uma fatia ponta a ponta ou a uma redução de risco explicitamente mensurável.

### Aceitar o happy path como definição de pronto

O caminho feliz pode ser uma primeira hipótese, mas não deve deixar de fora autorização, validação, integridade e tratamento de falhas necessários para segurança e correção.

### Confundir story points, horas e velocidade da IA

Pontos relativos ajudam comparação e conversa; não são horas. A quantidade de linhas geradas ou a rapidez da resposta não mede trabalho total nem qualidade.

### Usar estimativa como compromisso imutável

Quando a estimativa vira promessa, a equipe tende a esconder incerteza ou cortar qualidade. Registre premissas, revise com evidência e use a estimativa para decidir.

### Usar CI verde como aprovação automática

CI detecta classes de falhas configuradas. Ela não conhece todos os requisitos, não substitui revisão de lógica de negócio e não garante que a autorização está correta.

### Revisar apenas o código novo sem o impacto

Uma mudança curta pode alterar permissões, migrações, contratos e dados existentes. Faça revisão orientada ao diff e ao impacto, incluindo consumidores e controles de segurança.

### Deixar flags, TODOs e experimentos sem dono

Toda flag deve ter finalidade, proprietário, condição de remoção, teste e data de revisão. Caso contrário, o mecanismo de reversão se transforma em complexidade permanente.

## Exercício prático

Escolha uma funcionalidade moderadamente complexa, como “permitir que uma pessoa altere o endereço de entrega”. Não implemente o produto inteiro. Produza um plano de uma página com: resultado do usuário, fora do escopo, atores e permissões, seis fatias verticais possíveis, ordem justificada, estimativa relativa 1/2/3/5, principal risco de cada fatia, critérios de aceite e checkpoints.

Em seguida, crie um repositório de exercício e peça à IA apenas o plano da primeira fatia. Verifique se ela pergunta sobre autenticação, validação do endereço, autorização do recurso, auditoria e rollback antes de gerar código. Após aprovar, peça uma implementação mínima com teste. Faça um commit único e legível, abra um pull request e configure CI para lint e testes. Conduza uma revisão manual procurando autorização no servidor, exposição de dados pessoais, mensagens de erro, logs e comportamento em concorrência.

Entregue três artefatos: o backlog fatiado, o diff revisado e um diário curto de decisões. Para cada item, registre o que a IA sugeriu, o que foi aceito ou rejeitado e qual evidência sustentou a decisão. O exercício está completo somente quando outra pessoa consegue reproduzir os testes, entender o rollback e explicar por que a fatia é segura o bastante para o próximo ambiente.

## Referências

[1]: https://www.agilealliance.org/wp-content/uploads/2021/06/N.Paez_.A-tale-of-Slicing-and-Imagination-final.pdf "A Tale of Slicing and Imagination — Agile Alliance"

[2]: https://martinfowler.com/bliki/PurposeOfEstimation.html "Purpose Of Estimation — Martin Fowler"

[3]: https://csrc.nist.gov/pubs/sp/800/218/final "Secure Software Development Framework (SSDF) Version 1.1 — NIST SP 800-218"

[4]: https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html "Secure Code Review Cheat Sheet — OWASP"

[5]: https://git-scm.com/docs/user-manual "Git User Manual — Repositories, Branches and Commits"

[6]: https://docs.github.com/en/actions/get-started/continuous-integration "Continuous integration — GitHub Actions documentation"

[7]: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions "Workflow syntax for GitHub Actions — GitHub Docs"

## Fontes consultadas e escopo da verificação

Foram abertas e lidas as páginas acima. A documentação oficial do Git foi usada para fundamentar commits, branches, histórico e trabalho em linhas paralelas. A documentação do GitHub foi usada para CI, gatilhos, jobs e permissões de workflows. O NIST foi usado para a integração de segurança ao ciclo de desenvolvimento. A OWASP foi usada para diferenciar verificações automatizadas de revisão humana orientada a lógica de negócio e contexto. O relato da Agile Alliance foi usado para o conceito de fatia vertical, refinamento, estimativa relativa e feature flags. O artigo de Martin Fowler foi usado para limites e propósito das estimativas. A consulta ao glossário da Agile Alliance foi tentada, mas a página retornou bloqueio de cookies; por isso ela não foi usada como suporte factual no texto.

As recomendações sobre interação com IA são apresentadas como práticas de planejamento derivadas desses princípios e como orientação de engenharia, não como alegações de que as fontes citadas estudem especificamente todo o fenômeno chamado Vibe Coding.
