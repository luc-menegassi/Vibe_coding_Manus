# Capítulo 6 — Construção e publicação no GitHub com Actions

## Tese

**GitHub Flow, pull requests e GitHub Actions formam um sistema de controle, evidência e automação; não são apenas um atalho para publicar código.** A IA de programação pode acelerar a criação de branches, testes, lint, workflows e scripts de release, mas não assume a responsabilidade por requisitos, segurança, permissões, revisão nem pelo impacto de um deploy. O objetivo de um fluxo responsável é fazer a velocidade da geração trabalhar dentro de limites verificáveis: mudanças pequenas, revisão humana, verificações automatizadas, credenciais de menor privilégio e promoção deliberada para cada ambiente.

O GitHub Flow recomenda criar uma branch descritiva, trabalhar nela, fazer commits pequenos, abrir um pull request, responder à revisão, fazer merge e excluir a branch concluída [1]. O Git trata branches de tópico como ramos curtos para uma mudança específica, o que reduz o escopo da revisão e facilita reverter ou abandonar uma abordagem [2]. Essa disciplina é especialmente importante quando a mudança foi sugerida por uma IA: uma resposta rápida não transforma código não compreendido em código aprovado.

## Objetivos de aprendizagem

Ao terminar este capítulo, a pessoa deverá ser capaz de:

1. Explicar como branches, commits e pull requests criam uma fronteira de revisão antes da branch padrão.
2. Projetar um workflow de integração contínua que execute lint, testes e build em eventos adequados e apresente o resultado no pull request.
3. Configurar proteção de branch com revisão obrigatória, status checks e resolução de conversas, entendendo as diferenças entre checks estritos e flexíveis.
4. Declarar permissões do `GITHUB_TOKEN` explicitamente e separar o que é leitura, escrita, CI e deploy.
5. Armazenar secrets em repositório ou ambiente sem colocá-los no código, nos logs ou em branches de contribuições não confiáveis.
6. Distinguir artefato de CI, release baseada em tag e deploy para um ambiente, incluindo aprovação e rastreabilidade.
7. Trabalhar com uma IA de programação como geradora de rascunhos e parceira de análise, sem delegar a ela a aceitação técnica ou a autorização de produção.

## Conceitos centrais

### 1. Fluxo GitHub e branches

Uma branch de tópico deve representar uma unidade coerente de trabalho. O nome deve indicar a intenção, como `feat/login-rate-limit` ou `fix/timeout-test`; a branch não deve misturar refatoração, mudança funcional e atualização de infraestrutura sem uma razão clara. Commits isolados e descritivos facilitam a revisão, o diagnóstico e o revert. O GitHub Flow não exige um modelo complexo de branches de longa duração: a escolha entre branches curtas e branches estáveis adicionais deve refletir o tamanho, a cadência e o risco do produto.

A branch padrão deve ser tratada como uma superfície protegida. A mudança chega a ela por pull request, não por um push casual. Ao terminar o trabalho, a branch de tópico pode ser excluída; o histórico do pull request e dos commits permanece disponível [1].

### 2. Pull request como controle técnico

Um pull request é uma proposta de integração, não apenas um formulário para solicitar merge. Seu texto deve registrar o problema, a solução, o escopo, as limitações e a forma de validação. Deve ligar a issue ou requisito correspondente e declarar riscos conhecidos. Um pull request em rascunho é apropriado para pedir orientação antes de considerar a mudança pronta [1].

A revisão humana deve examinar comportamento, testes, tratamento de erros, observabilidade, custo, compatibilidade, dependências e segurança. Status checks informam que um processo automatizado terminou; não substituem a leitura do diff nem o julgamento sobre se o requisito foi atendido.

### 3. Proteção de branches

As regras de proteção podem exigir aprovação de pull request, status checks, resolução de conversas, commits assinados, histórico linear, fila de merge e deploy bem-sucedido antes do merge [3]. Para um produto de formação, um conjunto mínimo razoável é exigir pull request, pelo menos uma aprovação independente, checks de CI bem nomeados e resolução de conversas.

A proteção pode ser estrita ou flexível em relação à atualização da branch. No modo estrito, a branch deve estar atualizada com a base antes do merge; isso aumenta a quantidade de builds, mas testa a combinação mais recente. No modo flexível, há menos builds, porém uma incompatibilidade pode aparecer somente depois do merge [3]. A equipe deve escolher conscientemente, e não interpretar um check verde de uma versão antiga da base como prova absoluta.

### 4. Workflow, jobs e steps

Um workflow é um arquivo YAML em `.github/workflows` composto por um ou mais jobs. Eventos em `on` determinam quando ele é iniciado; jobs definem máquinas e dependências; steps executam actions ou comandos [4]. O workflow deve ser pequeno o suficiente para ser revisado como código. Nomeie jobs com identificadores únicos, porque nomes repetidos podem tornar status checks ambíguos e impedir o merge [3].

Em CI, o fluxo típico é: fazer checkout em uma versão conhecida do código, instalar uma versão explícita do runtime, instalar dependências de modo reprodutível, executar lint, executar testes, executar verificações de segurança e construir o artefato. O GitHub apresenta os resultados no pull request, permitindo descobrir regressões antes do merge [5]. Uma matriz pode testar versões e sistemas suportados, mas deve ser limitada às combinações que o produto realmente promete.

`pull_request` é normalmente o evento adequado para validar código proposto. `push` na branch padrão pode reconstruir o estado integrado. Para publicação, use tags ou uma decisão explícita de release. Triggers de privilégio elevado, como `pull_request_target` e `workflow_run`, exigem cuidado especial: o GitHub alerta que fazer checkout de conteúdo não confiável nesses contextos pode expor escrita no repositório, cache privilegiado e secrets [6].

### 5. Lint, testes e build como evidência, não como garantia

Lint verifica convenções e alguns erros estáticos; testes verificam comportamentos escolhidos; build verifica que o produto pode ser empacotado. Code scanning, análise de dependências e cobertura acrescentam sinais úteis. Nenhum desses sinais prova que requisitos não testados estão corretos ou que uma mudança não contém um risco operacional.

O pipeline deve falhar de forma explícita quando uma etapa essencial falha. Não use `continue-on-error` para esconder falhas sem uma justificativa documentada. Registre versões de runtime, dependências e ferramentas para tornar o resultado reproduzível. Prefira promover o artefato produzido e validado em CI, em vez de reconstruir silenciosamente um código diferente durante o deploy.

### 6. Permissões e `GITHUB_TOKEN`

O campo `permissions` controla os escopos do token. É possível declarar `read`, `write` ou `none`; quando se declara qualquer escopo, os não declarados passam a `none` [4]. Comece com `permissions: {}` e habilite somente o necessário por workflow ou job. Para CI que apenas faz checkout, instala dependências e testa, `contents: read` costuma ser suficiente; o valor efetivo deve ser confirmado para o evento e para o repositório.

Um job de release ou deploy não deve herdar permissões amplas apenas porque o YAML foi copiado de um exemplo. Separe jobs de CI e publicação, limite o job privilegiado à branch ou tag esperada e use um ambiente protegido. Para autenticação em um provedor de nuvem que ofereça OpenID Connect, considere credenciais de curta duração em vez de secrets duradouros [7].

### 7. Secrets, entradas não confiáveis e logs

Secrets podem existir no nível do repositório, da organização ou do ambiente. Um secret deve ser passado apenas ao step que precisa dele, como input ou variável de ambiente. Não o escreva no código, não o use em mensagens de debug e não o concatene em comandos sem compreender o escaping. O GitHub informa que, com exceção de `GITHUB_TOKEN`, secrets não são enviados a workflows disparados por pull requests de forks; secrets também não são automaticamente passados a workflows reutilizáveis [7]. O workflow deve tratar um secret ausente como uma condição esperada, e não como motivo para imprimir valores ou desabilitar proteções.

Entradas vindas de títulos, nomes de branch, comentários ou outros campos de pull request são dados não confiáveis. A documentação de uso seguro recomenda passar o valor como argumento de uma action ou como variável de ambiente intermediária, em vez de interpolá-lo diretamente em um script shell [6]. Faça quoting de variáveis e evite construir comandos a partir de contexto controlado por contribuinte.

### 8. Actions de terceiros e supply chain

Uma action de terceiros executa código no runner e pode interagir com outros jobs, arquivos compartilhados, token e secrets disponíveis. A orientação de segurança do GitHub recomenda fixar actions em um SHA completo verificado; tags como `v4` são mais fáceis de ler, mas são referências mutáveis [6]. Mantenha as actions e workflows atualizados com Dependabot, revise a origem e o diff da atualização, restrinja quais actions o repositório aceita e use CodeQL ou OpenSSF Scorecards quando fizer sentido.

O risco não se limita ao YAML. Dependências de aplicação, imagens Docker, scripts de instalação e runners também pertencem à cadeia de fornecimento. A OWASP destaca que CI/CD amplia a superfície de ataque e que pipelines usam, com frequência, identidades privilegiadas; recomenda revisar configuração do SCM, menor privilégio, isolamento dos executores, varreduras e aprovação antes de produção [8].

### 9. Environments, release e deploy

Um environment representa um destino ou estágio como `staging` ou `production`. Um job que referencia um environment precisa passar pelas regras de proteção antes de executar ou acessar seus secrets [9]. Pode haver revisores obrigatórios, impedimento de autoaprovação, temporizador, regras de branch/tag e regras personalizadas. Os secrets do ambiente só ficam disponíveis ao job depois que as proteções pertinentes são satisfeitas.

Release e deploy são conceitos relacionados, mas distintos. Uma release empacota uma versão, notas e arquivos binários para consumo; ela se baseia em uma tag que marca um ponto específico do histórico [10]. Deploy promove uma versão para um ambiente e deve deixar um registro de qual commit, tag ou artefato foi usado. Um fluxo responsável pode fazer CI em pull requests, publicar um artefato após merge, criar uma release ao receber uma tag semântica e promover para produção somente por um job limitado ao environment, com aprovação quando o risco exigir.

## Práticas recomendadas

1. **Comece pela mudança e pelo risco.** Peça à IA para transformar o requisito em uma lista de arquivos, invariantes, casos de erro, testes e riscos. Só depois peça um diff pequeno. A pessoa responsável deve conferir se a solução atende ao requisito, não apenas se compila.
2. **Trabalhe em branch curta e pull request pequeno.** Use uma branch por mudança relacionada. Faça commits que possam ser entendidos e revertidos. No pull request, descreva o porquê, o que foi testado, o que não foi testado e a decisão de segurança.
3. **Mantenha o CI determinístico.** Fixe versões relevantes, use instalação reprodutível e execute lint, testes, build e scanners em jobs separados quando isso tornar falhas mais claras. Faça o pull request receber exatamente os checks exigidos pela proteção da branch.
4. **Revise YAML como código de produção.** Verifique eventos, condições, expressões, comandos shell, nomes dos jobs, caminhos, artefatos, caches, concorrência e permissões. Uma IA pode criar um workflow aparentemente válido que executa em um evento privilegiado ou publica quando deveria apenas testar.
5. **Aplique menor privilégio.** Declare `permissions` no topo e rebaixe ainda mais em jobs. Não conceda `contents: write`, `pull-requests: write`, `packages: write` ou `id-token: write` ao job de CI sem necessidade explícita. Separe construção de publicação.
6. **Isole contribuições não confiáveis.** Em pull requests de forks, não espere secrets. Evite `pull_request_target` para executar código do pull request. Caso uma automação precise de contexto privilegiado, divida-a em workflows e jobs, não faça checkout de código não confiável no contexto privilegiado e exija revisão.
7. **Proteja produção com environment.** Use `production` com reviewers, branches/tags permitidos e secrets apenas do ambiente. Evite autoaprovação. Registre a versão promovida e forneça rollback conhecido.
8. **Controle a cadeia de actions.** Prefira actions pequenas e mantidas, verifique o repositório de origem, fixe SHA completo, mantenha uma política de atualização e examine mudanças automáticas. Não instale uma action apenas porque a IA a sugeriu.
9. **Use IA em ciclos verificáveis.** Um ciclo seguro é: pedir plano; pedir implementação mínima; executar testes locais; pedir à IA uma crítica de ameaças; revisar o diff humano; abrir pull request; ler falhas do CI; corrigir; e repetir. A IA deve explicar cada permissão e cada comando; respostas vagas são um sinal para interromper.
10. **Trate velocidade e responsabilidade como dimensões diferentes.** A IA reduz o tempo para produzir possibilidades e rascunhos. A equipe ainda responde por arquitetura, compatibilidade, privacidade, segurança, custo, observabilidade, operação e decisão de publicar.

### Exemplo didático de CI

O exemplo abaixo ilustra a separação entre validação em pull request e push para a branch principal. Em produção, as actions devem ser fixadas em SHAs completos verificados; `@v4` aparece aqui apenas para manter o exemplo legível.

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint, testes e build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4 # fixe em SHA completo após verificar a action
      - name: Configurar runtime
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - name: Instalar dependências
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Testes
        run: npm test -- --ci
      - name: Build
        run: npm run build
```

Esse YAML não decide se o produto é seguro e não faz deploy. Ele deve ser adaptado à linguagem e ao framework do projeto. O pull request deve exigir o check `Lint, testes e build`, e a equipe deve verificar se os scripts realmente testam o comportamento relevante. Para publicar, crie um job separado, condicionado a uma tag ou a uma branch aprovada, referenciando o artefato validado e um environment protegido.

## Antipadrões e seus riscos

- **Gerar diretamente na `main` e fazer push porque o código “parece simples”.** Remove a fronteira de revisão e torna a branch padrão o ambiente de experimento.
- **Aceitar o primeiro workflow produzido pela IA.** YAML válido pode conter evento amplo, permissões excessivas, action não confiável, checkout privilegiado ou shell vulnerável.
- **Usar `permissions: write-all` por conveniência.** Um token roubado ou uma action comprometida ganha capacidades que não são necessárias para CI.
- **Usar `pull_request_target` com checkout da branch do contribuinte.** Mistura código não confiável com contexto privilegiado, secrets e potencial de escrita no repositório [6].
- **Interpolar título de PR ou nome de branch diretamente em `run`.** Permite injeção de comandos; passe dados como input ou variável de ambiente devidamente tratada [6].
- **Colocar API keys em `.env`, YAML ou logs.** O histórico do Git e os artefatos podem persistir o vazamento. Revogue e substitua imediatamente qualquer credencial exposta.
- **Usar apenas lint ou apenas testes felizes.** O pipeline pode ficar verde enquanto falhas de autorização, entradas inválidas, regressões de integração ou comportamento operacional continuam sem teste.
- **Silenciar falhas com `continue-on-error` ou alterar o teste para passar.** Converte evidência negativa em falsa confiança.
- **Recompilar no deploy sem registrar a entrada.** Produz um binário diferente daquele que foi revisado e testado, reduzindo rastreabilidade e dificultando rollback.
- **Publicar em produção em todo `push` sem environment.** Um merge acidental ou uma alteração de configuração pode virar incidente antes de revisão operacional.
- **Confiar em tags mutáveis de actions ou em dependências sem atualização governada.** Um upstream comprometido pode alterar o que o runner executa sem uma mudança visível no diff do projeto [6] [8].
- **Tratar CI verde como aprovação funcional.** Checks demonstram apenas as propriedades codificadas nos checks, sob o ambiente e os dados usados naquele run.
- **Permitir que a própria automação aprove e faça merge sem supervisão.** Automatizar a alteração de código não elimina conflito de interesses nem a necessidade de revisão independente.

## Exercício: pipeline responsável de uma aplicação pequena

Crie um repositório mínimo de uma aplicação web ou biblioteca, usando uma linguagem que tenha lint, testes e build reproduzíveis. O exercício deve ser executado em cinco etapas.

1. **Fluxo Git.** Abra uma issue com um requisito pequeno. Crie uma branch `feat/...`, implemente a mudança em commits separados, inclua testes e abra um pull request em rascunho. Peça à IA um plano e um diff mínimo; registre no pull request quais trechos foram gerados ou revisados com IA.
2. **CI.** Crie `.github/workflows/ci.yml` para `pull_request` contra `main` e `push` em `main`. Execute instalação reprodutível, lint, testes e build. Faça um teste falhar deliberadamente, observe o status no pull request e só depois corrija. Confirme que o job falha quando lint, teste ou build falham.
3. **Governança.** Proteja `main` exigindo pull request, uma aprovação, o status do CI e resolução das conversas. Dê ao workflow somente `contents: read`. Peça à IA uma revisão de ameaças do YAML e compare cada sugestão com a documentação do GitHub antes de aceitar.
4. **Release e staging.** Após o merge, gere um artefato versionado. Crie uma tag como `v0.1.0` e uma release com notas e o artefato. Configure um environment `staging` com um secret fictício não sensível e, se possível, uma aprovação. O job de deploy deve aceitar somente tags ou uma referência explicitamente autorizada e deve registrar a versão implantada.
5. **Ataque controlado e retrospectiva.** Abra um pull request a partir de fork ou simule o evento sem disponibilizar secrets. Verifique que o secret não aparece no job. Depois introduza, em uma branch de teste, uma interpolação insegura de título de PR em um shell e substitua-a pelo padrão de variável de ambiente. Liste quais riscos a IA identificou, quais não identificou e quais decisões exigiram julgamento humano.

O exercício é concluído quando o PR não pode ser mesclado sem aprovação e CI verde; o workflow não imprime secrets; o job de CI possui apenas leitura; a publicação deixa uma tag, release e artefato identificáveis; e o deploy de staging fica separado da validação. Um resultado verde sem essas propriedades não é aprovação do exercício.

## Referências

[1]: https://docs.github.com/en/get-started/using-github/github-flow "GitHub flow"
[2]: https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows "Git Branching — Branching Workflows"
[3]: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches "About protected branches"
[4]: https://docs.github.com/actions/reference/workflow-syntax-for-github-actions "Workflow syntax for GitHub Actions"
[5]: https://docs.github.com/en/actions/get-started/continuous-integration "Continuous integration"
[6]: https://docs.github.com/en/actions/reference/security/secure-use "Secure use reference"
[7]: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions "Using secrets in GitHub Actions"
[8]: https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html "CI/CD Security Cheat Sheet"
[9]: https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment "Managing environments for deployment"
[10]: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases "About releases"

As fontes foram abertas e lidas durante a pesquisa. A documentação do GitHub foi priorizada para comportamento específico da plataforma; a documentação do Git foi usada para práticas de branching; a OWASP foi usada para riscos e controles de segurança de CI/CD. Recursos e limites podem variar conforme plano do GitHub, tipo de repositório, evento e configuração da organização; confirme a política vigente antes de aplicar um deploy real.
