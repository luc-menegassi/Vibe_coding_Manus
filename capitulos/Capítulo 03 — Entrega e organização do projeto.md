# Capítulo 03 — Entrega e organização do projeto

## Tese

Uma entrega responsável não é apenas um diretório que contém código que “funciona na máquina de quem o gerou”. Ela é um artefato **reprodutível, compreensível, auditável e operável**: outra pessoa consegue clonar o repositório, instalar as dependências, configurar o ambiente, executar testes, construir o produto e entender as decisões relevantes. A IA de programação pode acelerar a criação de arquivos, configurações e trechos de implementação, mas não assume a responsabilidade técnica por esses resultados. A velocidade de geração reduz o tempo de digitação; não reduz a necessidade de escolher uma estrutura coerente, revisar dependências, proteger segredos, controlar versões, testar e definir os critérios de aceite.

Este capítulo trata exclusivamente da organização e da entrega do projeto: estrutura de diretórios, convenções, documentação, configuração, dependências, versionamento, automação e entregáveis. Os exemplos devem ser adaptados à linguagem e ao framework escolhidos; não existe uma árvore universalmente correta.

## Objetivos de aprendizagem

Ao concluir o capítulo, a pessoa deve conseguir:

1. Definir uma estrutura de diretórios que torne claros os limites entre código-fonte, testes, documentação, scripts, infraestrutura e artefatos gerados.
2. Documentar o caminho feliz e os caminhos de falha para que outra pessoa possa instalar, executar, testar e entregar o projeto.
3. Separar configuração de código e manter segredos fora do repositório, usando exemplos seguros e validação explícita.
4. Declarar, fixar e atualizar dependências com um processo verificável, incluindo dependências transitivas e alertas de vulnerabilidade.
5. Usar Git para criar pequenos snapshots compreensíveis, revisar exatamente o que será commitado e colaborar por branches, pull requests e checks.
6. Construir um pipeline mínimo de integração contínua que valide o projeto e tenha permissões menores que o necessário.
7. Produzir um pacote de entrega que inclua código, documentação, configuração de exemplo, instruções operacionais, evidências de validação e um histórico de versão.
8. Trabalhar com uma IA de programação como assistente revisável, sem transformar uma resposta plausível em evidência de qualidade ou segurança.

## Conceitos centrais

### 1. Estrutura de diretórios é uma interface de manutenção

A estrutura deve revelar onde cada responsabilidade vive. Um ponto de partida possível é:

```text
projeto/
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
├── CHANGELOG.md
├── .gitignore
├── .env.example
├── pyproject.toml            # ou package.json, go.mod, Cargo.toml etc.
├── lockfile                  # nome definido pelo ecossistema
├── src/                      # código de produção
├── tests/                    # testes automatizados
├── docs/                     # decisões, arquitetura e operação
├── scripts/                  # automações reproduzíveis do projeto
├── config/                   # somente configuração não secreta e versionável
├── infra/                    # IaC, manifests ou arquivos de implantação
├── .github/
│   └── workflows/            # CI/CD, quando GitHub Actions for usado
└── Dockerfile                # opcional, se houver imagem
```

A árvore não deve ser copiada mecanicamente. Um projeto pequeno pode não precisar de `infra/` ou de camadas adicionais. Um monorepo precisará explicitar os limites entre aplicações e bibliotecas. O critério é reduzir ambiguidade: arquivos de produção não devem ficar misturados com testes, saídas de build, caches ou segredos. Artefatos gerados devem ser recriados por comandos documentados ou publicados em um canal apropriado, em vez de serem tratados como fonte primária.

Quando GitHub Actions é usado, os workflows precisam estar em `.github/workflows` e ser arquivos YAML [1]. Essa convenção não é apenas estética: é o local que o serviço procura para descobrir a automação do repositório.

### 2. Convenções são contratos de colaboração

Uma convenção útil responde a perguntas observáveis: como nomear módulos, onde colocar testes, qual versão mínima do runtime, como formatar o código, como nomear branches, como escrever commits, como revisar uma mudança e quais comandos verificam o projeto. A convenção deve aparecer em arquivos versionados e ser reforçada por ferramentas — formatador, linter, testes e CI — em vez de depender exclusivamente de memória.

O `README.md` é o mapa de entrada. A recomendação oficial do GitHub é ter um README em todo repositório; junto com licença, arquivo de citação, diretrizes de contribuição e código de conduta, ele comunica expectativas e facilita a navegação [2]. Para um projeto formativo, o README deve conter pelo menos: finalidade e limites do sistema; pré-requisitos; instalação; configuração; comandos de desenvolvimento, teste e build; exemplo de uso; estrutura resumida; como reportar problemas; versão ou estado do projeto; e licença, quando aplicável.

`CONTRIBUTING.md` deve explicar o fluxo de mudança. `SECURITY.md` deve indicar como reportar vulnerabilidades sem publicá-las em uma issue. `CHANGELOG.md` ou notas de release devem registrar mudanças que importam para usuários e operadores. Decisões que alteram a estrutura, os dados, a segurança ou a operação podem ser registradas em `docs/` como decisões curtas, com contexto, alternativas, decisão e consequências.

### 3. Configuração não é segredo

Código deve conter comportamento estável; configuração deve permitir adaptar esse comportamento a desenvolvimento, teste e produção. Variáveis de ambiente, arquivos de configuração e parâmetros de inicialização devem ter nomes, tipos, valores obrigatórios e defaults documentados. O repositório pode conter `.env.example` com valores fictícios, mas não deve conter tokens, chaves privadas, senhas ou dados reais. O `.gitignore` deve excluir arquivos locais e saídas que não pertencem ao snapshot; ele não é um mecanismo de revogação de segredo já exposto.

A configuração deve falhar cedo quando faltar um valor crítico e deve evitar registrar valores sensíveis em logs. A IA costuma preencher placeholders com strings que parecem reais ou sugerir que uma credencial fique no código para “simplificar o exemplo”. O responsável deve substituir isso por um fluxo de secrets do ambiente de execução e verificar o diff completo antes do commit. Se um segredo for exposto, o procedimento não é apenas apagá-lo em um commit posterior: é revogá-lo, substituí-lo e avaliar o histórico.

### 4. Dependências são parte da superfície de risco

Um manifesto declara dependências diretas; um lockfile registra uma resolução concreta, quando o ecossistema o suporta. Ambos devem ser tratados como parte da entrega. A equipe precisa distinguir dependências de runtime, desenvolvimento e produção, registrar a versão do runtime e decidir como atualizações serão propostas, testadas e aprovadas.

A OWASP observa que o uso de terceiros desloca parte da postura de segurança da aplicação para suas dependências e recomenda análise automatizada desde o início do projeto, pois adiar a tarefa pode acumular grande quantidade de problemas [3]. Portanto, o pipeline deve verificar vulnerabilidades, e cada alerta deve ser analisado em contexto: versão corrigida, impacto real, alcance da dependência, compatibilidade e mitigação. Um alerta não deve ser ignorado automaticamente nem convertido em atualização sem testes.

A atualização segura combina inventário, mudança pequena, testes e registro da decisão. Para dependências transitivas, é necessário entender a cadeia até a dependência direta que pode ser atualizada. A presença de um lockfile melhora a reprodutibilidade, mas não torna a dependência confiável por si só.

### 5. Versionamento é rastreabilidade, não decoração

Git diferencia arquivos rastreados, modificados, preparados no staging e não rastreados. O fluxo documentado pelo Git é inspecionar o estado, preparar intencionalmente o conteúdo e criar um snapshot por commit [6]. Isso é especialmente importante com IA, porque uma geração pode alterar muitos arquivos, incluir arquivos não solicitados ou misturar refatoração com correção.

Antes do commit, use `git status`, examine `git diff` e `git diff --staged`, procure segredos e confirme que arquivos gerados não entraram. Faça commits pequenos e semanticamente coerentes. Uma mensagem deve explicar a intenção da mudança, não apenas repetir o nome do arquivo. Branches e pull requests tornam a revisão explícita; a branch principal deve ter checks obrigatórios e revisão para mudanças relevantes. O GitHub recomenda preferir branches no mesmo repositório para colaboradores regulares e usar proteção de branches com checks e revisões [2]. Tags ou releases devem identificar versões que podem ser recuperadas e associadas a notas de mudança.

### 6. CI é uma barreira de feedback, não uma prova total

Um workflow mínimo deve instalar a versão suportada do runtime, instalar dependências de modo reproduzível, executar formatador ou verificação de estilo, testes e build. Quando fizer sentido, deve incluir análise de dependências, varredura de segredos e análise estática. O workflow deve declarar gatilhos adequados, separar jobs e publicar logs ou artefatos úteis sem expor dados sensíveis.

A sintaxe do GitHub Actions permite configurar `on`, jobs e `permissions`; se permissões forem especificadas, as que não forem listadas ficam como `none`, e permissões podem ser definidas no nível do workflow ou do job [1]. A prática responsável é começar com acesso mínimo e elevar apenas o que um job realmente precisa. Workflows reutilizáveis externos devem ser referenciados por uma revisão estável; a documentação aponta o commit SHA como a opção mais segura para estabilidade e segurança [1].

CI não substitui revisão de requisitos, testes exploratórios, análise de ameaça ou validação de operação. Um pipeline verde significa que os checks definidos passaram naquele ambiente, não que o sistema está correto para qualquer entrada ou cenário.

### 7. Imagens e ambientes também precisam ser entregáveis reproduzíveis

Se o projeto usa Docker, o `Dockerfile` e o `.dockerignore` pertencem à organização da entrega. A documentação do Docker recomenda builds multi-stage para separar compilação da imagem final, imagens-base confiáveis e pequenas, rebuilds frequentes, exclusão de arquivos irrelevantes com `.dockerignore` e containers tão efêmeros quanto possível [4]. Também recomenda evitar pacotes desnecessários e considerar a fixação de uma imagem por digest quando a rastreabilidade da cadeia exigir isso [4].

Essas escolhas têm trade-offs. Fixar um digest melhora a repetibilidade, mas exige um processo de atualização para receber correções. Usar uma tag móvel pode receber patches automaticamente, mas muda o resultado de builds ao longo do tempo. A decisão deve ser documentada e automatizada, não deixada ao acaso ou à sugestão de uma IA.

## Práticas recomendadas

### Um fluxo de trabalho com IA

1. **Defina o contrato antes do prompt.** Escreva stack, versão do runtime, comandos esperados, restrições de segurança, diretórios permitidos e critérios de aceite. Peça à IA um plano e uma árvore proposta antes de pedir arquivos.
2. **Gere em fatias pequenas.** Solicite primeiro a estrutura e o README; depois configuração e dependências; depois CI; por fim o código necessário para o exercício. Isso facilita atribuir cada mudança a uma intenção.
3. **Exija justificativas verificáveis.** Peça que cada arquivo novo seja listado, que cada dependência tenha motivo e que os comandos possam ser executados localmente. Não aceite “está pronto” como evidência.
4. **Mantenha a IA no contexto certo.** Forneça o manifesto, a árvore, os erros e o diff relevante. Não cole tokens, dados pessoais ou código confidencial sem autorização e sem controles do ambiente.
5. **Revise como mantenedor.** Compare a árvore antes e depois, leia o diff por arquivo, confira licenças e versões, execute os comandos do README e verifique a configuração em ambiente limpo.
6. **Teste adversarialmente.** Pergunte à IA quais são os riscos da própria alteração, quais entradas falham, que permissões são usadas e quais arquivos podem conter segredo. Em seguida, confirme as respostas por inspeção e execução.
7. **Registre decisões humanas.** O commit, a revisão e a documentação devem explicar por que uma dependência, estrutura, permissão ou estratégia de versionamento foi escolhida. A conversa com a IA não substitui esse registro.

### Checklist de entrega

- O clone limpo instala sem depender de arquivos ignorados ou estado local.
- O README informa pré-requisitos, comandos de instalação, configuração, teste, build e execução.
- A árvore separa fonte, testes, documentação, scripts e infraestrutura de forma compreensível.
- Há manifesto e lockfile compatíveis com o ecossistema, além da versão do runtime.
- `.gitignore` e `.dockerignore`, quando aplicáveis, excluem caches, builds e arquivos locais; nenhum segredo está versionado.
- O `.env.example` contém apenas valores fictícios e documenta variáveis obrigatórias.
- CI executa checks relevantes em uma versão definida do runtime e usa permissões mínimas.
- Dependências foram inventariadas, analisadas e atualizadas ou aceitas com justificativa.
- `git diff --staged` contém apenas o escopo pretendido; a branch, a revisão e a tag são recuperáveis.
- A entrega inclui notas de mudança, limitações conhecidas e instruções para reportar vulnerabilidades.

## Antipadrões e riscos

**“Funciona localmente” como critério de aceite.** O resultado depende de cache, versão instalada, segredo local ou arquivos não documentados. O risco é uma falha de reprodução que aparece somente na entrega. Corrija usando ambiente limpo, comandos documentados e CI.

**Árvore plana ou sem limites.** Misturar código, testes, builds, downloads, screenshots e configurações torna difícil encontrar a fonte e aumenta a chance de publicar artefatos. Corrija por responsabilidade, não por quantidade arbitrária de pastas.

**README promocional sem procedimento.** Descrever a ideia sem informar pré-requisitos e comandos transfere o custo de descoberta para cada colaborador. Corrija testando o README em um clone limpo.

**Segredo protegido apenas por `.gitignore`.** O arquivo pode ser commitado, copiado, enviado por log ou permanecer no histórico. Corrija com secrets do ambiente, varredura, revogação imediata e revisão do histórico quando necessário. O GitHub recomenda secret scanning, push protection e code scanning como recursos de proteção do repositório [2].

**Dependência “latest” sem lockfile ou sem processo de atualização.** O build pode mudar sem mudança no código e uma vulnerabilidade pode permanecer invisível. Corrija com versões compatíveis, resolução reproduzível, monitoramento e testes de atualização.

**Aceitar código da IA por plausibilidade.** Código compilável pode ter licença incompatível, permissões excessivas, tratamento de erro ausente ou comportamento inseguro. Corrija exigindo diff revisável, testes, análise de dependências e revisão humana responsável pelo merge.

**CI com permissões amplas ou ações flutuantes.** Um workflow comprometido pode alterar o repositório ou exfiltrar dados. Corrija com `permissions` mínimos, secrets restritos, revisão de workflows e referências estáveis, preferencialmente SHA quando a política exigir.

**Dockerfile que copia tudo, usa base grande e não recebe rebuild.** O contexto pode conter segredos e a imagem pode carregar ferramentas e vulnerabilidades desnecessárias. Corrija com `.dockerignore`, multi-stage, base confiável e pequena, rebuild periódico e política explícita de pinning.

**Commit gigante gerado de uma vez.** A revisão não consegue separar intenção, refatoração e efeitos colaterais. Corrija dividindo tarefas e commits, e não use o tamanho da resposta da IA como unidade de entrega.

## Exercício prático — “Entrega reproduzível de um serviço pequeno”

Crie, individualmente ou em dupla, um serviço mínimo que exponha uma função de negócio simples. A tecnologia é livre, mas o repositório deve conter `src/`, `tests/`, `docs/`, `scripts/`, `README.md`, `.gitignore`, `.env.example`, manifesto de dependências e lockfile. Se usar Docker, inclua `Dockerfile` e `.dockerignore`; se usar GitHub, inclua `.github/workflows/ci.yml`.

Na primeira etapa, peça à IA apenas uma proposta de árvore, convenções e comandos. Compare a proposta com as necessidades do serviço e registre uma decisão curta em `docs/decisions/001-organizacao.md`. Na segunda, peça os arquivos de documentação e configuração. Substitua valores sensíveis por placeholders e revise o diff. Na terceira, peça um workflow de CI com testes, build e permissões mínimas. Confira manualmente o gatilho, as versões do runtime, os secrets e as ações referenciadas. Na quarta, implemente a função em commits pequenos; para cada mudança gerada pela IA, peça testes e uma lista de riscos antes de aceitar o patch.

A entrega final deve passar por este roteiro, em uma máquina ou container limpo:

```bash
git clone <url>
cd <projeto>
# seguir exatamente o README
# instalar dependências
# executar formatador/linter, testes e build
# executar o serviço com valores do .env.example
git status --short
```

O participante deve entregar a URL ou arquivo do repositório, a tag da versão, o relatório da execução dos comandos, uma lista de decisões humanas e uma seção “limitações e riscos conhecidos”. A avaliação considera reprodução por uma pessoa externa, clareza da estrutura, ausência de segredos, lockfile e tratamento de dependências, qualidade do CI, rastreabilidade dos commits e a capacidade de explicar o que a IA sugeriu e o que foi verificado. Um projeto não recebe aprovação apenas porque compila: geração rápida é um ganho de produtividade; a responsabilidade pela arquitetura, segurança, manutenção e aceite continua com a equipe.

## Referências

[1]: https://docs.github.com/actions/reference/workflow-syntax-for-github-actions "GitHub Docs — Workflow syntax for GitHub Actions"
[2]: https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories "GitHub Docs — Best practices for repositories"
[3]: https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html "OWASP Cheat Sheet — Vulnerable Dependency Management"
[4]: https://docs.docker.com/build/building/best-practices/ "Docker Docs — Building best practices"
[5]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218 — Secure Software Development Framework (SSDF) Version 1.1"
[6]: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository "Pro Git — Recording Changes to the Repository"

As fontes [1] a [6] foram abertas e lidas. O NIST SSDF [5] é usado como referência de contexto para a responsabilidade de incorporar práticas de segurança ao ciclo de desenvolvimento; as recomendações operacionais específicas deste capítulo são delimitadas pelas fontes de Git, GitHub, OWASP e Docker acima.
