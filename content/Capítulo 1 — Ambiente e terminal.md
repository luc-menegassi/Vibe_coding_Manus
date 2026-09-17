# Capítulo 1 — Ambiente e terminal

## Escopo e tese

Este capítulo trata da preparação do ambiente local, do terminal e do shell, do Git, das variáveis de ambiente, da reprodutibilidade e da higiene operacional. A tese central é simples: **a IA pode reduzir o tempo de produzir uma alteração, mas não transfere a responsabilidade de compreender, revisar, testar, proteger e registrar o que foi alterado**. Vibe Coding responsável usa a velocidade de geração como acelerador de um processo de engenharia; não usa a velocidade como justificativa para pular o processo.

O ambiente local é parte do sistema. Versões diferentes de interpretador, shell, Git, dependências ou ferramentas mudam resultados. O terminal é uma interface poderosa, mas comandos podem apagar dados, expor segredos ou executar entradas não confiáveis. Git oferece rastreabilidade e recuperação, mas somente para o que foi corretamente inspecionado e registrado. Variáveis de ambiente ajudam a separar configuração do código, porém não são um cofre por si só. A reprodutibilidade exige declarar versões, entradas, comandos e condições relevantes. A IA deve operar dentro desses limites, com contexto suficiente e autoridade limitada.

## Objetivos de aprendizagem

Ao final, a pessoa leitora deverá ser capaz de:

1. Preparar um ambiente local verificável, identificando sistema operacional, shell, versões de linguagem, gerenciador de pacotes e Git.
2. Explicar a diferença entre working tree, staging area e Git directory, e usar essa diferença para revisar mudanças antes de registrá-las.
3. Executar comandos de shell com atenção a aspas, expansão, herança de ambiente, códigos de saída e possíveis efeitos destrutivos.
4. Separar configuração não sensível, segredos e artefatos locais, sem colocar credenciais no repositório ou em logs.
5. Tornar uma execução reproduzível por meio de arquivos de dependências, lockfiles, versões explícitas, scripts documentados e timestamps controlados quando necessário.
6. Trabalhar com uma IA de programação sem fornecer segredos, sem delegar a ela decisões não revisadas e sem executar comandos destrutivos por confiança implícita.
7. Reconhecer riscos de supply chain, injeção de scripts, dependências não fixadas, ambientes contaminados e falsa sensação de segurança.

## 1. O ambiente local como uma dependência explícita

Antes de pedir código à IA, registre o contexto que pode alterar o resultado. Isso inclui sistema operacional e arquitetura, versão do shell, versão do Git, versão do interpretador, gerenciador de pacotes, diretório de trabalho, comandos de instalação e arquivos de configuração relevantes. Um pedido como “corrija o projeto” omite premissas importantes; um pedido como “no Ubuntu 24.04, Bash, Python 3.12, ambiente virtual em `.venv`, execute os testes definidos em `pytest` e mostre um diff mínimo” reduz ambiguidade.

A preparação não precisa congelar toda a máquina. Ela precisa tornar as decisões importantes observáveis e repetíveis. O projeto deve declarar o que é necessário para recriar o ambiente, e o README deve conter um caminho curto de instalação, execução, teste e limpeza. Quando uma ferramenta tiver versões incompatíveis, escolha uma versão suportada e registre o motivo.

Em Python, `venv` cria um ambiente com pacotes independentes do ambiente-base. A documentação oficial recomenda tratá-lo como descartável, não versioná-lo no Git e recriá-lo em vez de movê-lo, porque os executáveis podem conter caminhos absolutos e o ambiente não é portável em geral [1]. A mesma ideia vale para `node_modules`, caches de compilação, diretórios de build e arquivos gerados: o repositório deve guardar as instruções e os manifestos necessários, não uma cópia acidental do estado local.

Uma preparação mínima pode incluir:

```bash
uname -a
printf 'shell=%s\n' "$SHELL"
git --version
python --version
python -m pip --version
```

Os comandos devem ser adaptados ao projeto e não devem ser tratados como prova de que a instalação está correta. O passo seguinte é executar o teste de sanidade documentado pelo próprio projeto. A IA pode sugerir esse inventário, mas a pessoa responsável deve confirmar se os caminhos, versões e ferramentas realmente correspondem ao ambiente.

## 2. Terminal, shell e fronteira de execução

O shell interpreta uma linguagem, não apenas uma lista de botões. No Bash, um processo recebe um ambiente como pares `nome=valor`; comandos executados herdam esse ambiente, e `export` adiciona ou altera o que será transmitido a processos-filhos [2]. Uma atribuição que precede um comando pode valer somente para aquele comando. Essa distinção é útil para reduzir escopo:

```bash
API_BASE_URL='https://example.test' ./scripts/test.sh
```

O valor acima não precisa permanecer exportado na sessão inteira. Para configuração local recorrente, use um mecanismo documentado pelo projeto e um arquivo de exemplo sem segredos, como `.env.example`. O `.env` real deve ser ignorado pelo Git e protegido por permissões e pelo gerenciador de segredos adequado ao contexto.

Aspas não são ornamentação. O Bash usa aspas para remover o significado especial de caracteres, desativar expansões e impedir que metacaracteres sejam interpretados [3]. Portanto, uma variável deve ser citada quando representa um único argumento:

```bash
arquivo='relatório final.txt'
cat -- "$arquivo"
```

A IA deve preferir comandos que mostrem primeiro o que será feito, separar caminhos em variáveis citadas e explicar qualquer uso de `eval`, substituição de comandos, redirecionamento, `xargs`, globbing ou permissões elevadas. `eval` e concatenação de entrada externa em uma string de shell ampliam a superfície de injeção. Em CI, uma entrada de pull request, nome de branch ou mensagem de commit pode ser controlada por outra pessoa; não a insira diretamente no texto de um script.

Quando a automação usar GitHub Actions, a própria documentação recomenda passar entradas não confiáveis por uma variável de ambiente intermediária e citá-la, em vez de interpolá-las na construção de um script de shell [4]. A regra geral é válida também localmente: dados devem ser tratados como dados, e não reprocessados como código.

Adote uma higiene operacional básica:

- confirme o diretório com `pwd` e liste o alvo com `ls` antes de ações destrutivas;
- prefira `git clean -ndx` para simular uma limpeza antes de qualquer `git clean -fdx`;
- não execute comandos recebidos da IA como um bloco sem ler cada linha;
- use `--` antes de nomes de arquivos quando o comando aceitar essa convenção;
- use `set -euo pipefail` em scripts Bash quando a semântica do script tiver sido revisada e os casos de erro estiverem tratados;
- capture códigos de saída e mensagens, sem ocultar uma falha com `|| true` apenas para deixar o fluxo verde;
- não use `sudo`, acesso ao socket Docker ou permissões amplas como atalho para corrigir uma instalação sem entender o impacto.

## 3. Git como memória, limite e ponto de revisão

O Git trabalha conceitualmente com snapshots. A documentação do Pro Git descreve três estados: `modified`, `staged` e `committed`, correspondentes ao working tree, à staging area e ao Git directory [5]. O fluxo seguro não é “gerar e commitar”; é modificar, inspecionar, selecionar o que entra no próximo snapshot e só então registrar:

```bash
git status --short
git diff
git diff --check
git add -p
git diff --cached
git commit -m "Descreve a mudança observável"
```

`git add -p` é particularmente útil quando a IA misturou correção, formatação e arquivos que não pertencem à tarefa. O commit deve ser pequeno o suficiente para explicar seu propósito e reverter sem investigação arqueológica. Depois, `git show --stat --oneline HEAD` e `git status --short` confirmam o estado resultante.

Configurações do Git podem existir no nível do sistema, do usuário, do repositório ou do worktree; `git config` lê e grava nesses escopos conforme a opção usada [6]. Em uma máquina compartilhada, um comando como `git config --global` altera todos os repositórios daquele usuário. A IA deve perguntar ou indicar o escopo antes de sugerir mudanças globais. Para uma exceção local, prefira a configuração do repositório:

```bash
git config --local user.name "Nome do Projeto"
git config --local user.email "projeto@example.invalid"
```

Nunca trate o commit como certificado de correção. Git comprova que uma fotografia foi registrada e ajuda a recuperar versões; não prova que os testes estão completos, que a dependência é confiável ou que não há segredo no histórico. Antes de publicar, procure segredos também no histórico, nos artefatos e nos logs. Se uma credencial foi commitada, removê-la do arquivo atual não basta: ela deve ser revogada ou rotacionada e o histórico deve ser tratado conforme o procedimento da organização.

## 4. Variáveis de ambiente e segredos

Separe três categorias:

1. **Configuração não sensível**, como modo de execução, URL pública e nível de log. Pode ser documentada e versionada quando apropriado.
2. **Valores específicos do ambiente**, como endpoints internos e nomes de buckets. Devem ser injetados por ambiente, com escopo claro.
3. **Segredos**, como tokens, senhas, chaves privadas e credenciais. Devem ser fornecidos por um gerenciador de segredos, mecanismo de CI ou arquivo local fora do controle de versão.

Uma variável de ambiente é uma forma de entrega, não uma garantia de confidencialidade. A OWASP alerta que variáveis podem ficar acessíveis a processos e aparecer em logs ou dumps; também recomenda não codificar segredos em `Dockerfile` com `ENV` ou `ARG` e preferir injeção durante execução por um orquestrador ou um gerenciador apropriado [7]. Para desenvolvimento local, `.env.example` pode conter nomes e valores fictícios; `.env` deve estar no `.gitignore`, e o programa deve falhar com mensagem segura quando uma variável obrigatória não existir.

No GitHub Actions, variáveis têm escopos de workflow, job e step; a sintaxe também varia entre o contexto processado pelo GitHub e o shell executado no runner [8]. Segredos não são disponibilizados, com exceção de `GITHUB_TOKEN`, para workflows acionados por repositórios forkados. O GitHub recomenda evitar passar segredos pela linha de comando, porque argumentos podem ser visíveis em processos ou auditorias; quando necessário, use variáveis de ambiente, `STDIN` e aspas adequadas [9]. Mascaramento não é uma autorização para imprimir o segredo: valores transformados ou estruturados podem não ser redigidos de modo confiável.

Boas práticas para uma IA de programação:

- nunca cole tokens, cookies, chaves privadas, dumps de produção ou conteúdo integral de `.env` no prompt;
- substitua valores por placeholders com o mesmo formato, como `API_TOKEN_REDACTED`;
- peça código que leia o nome da variável, não o valor;
- solicite um plano e um diff antes de pedir execução;
- limite o processo ao diretório do projeto e negue rede, deploy e escrita fora dele quando não forem necessários;
- revise toda instrução que imprime ambiente (`env`, `printenv`, `set`, `docker inspect`) ou inclui variáveis em logs;
- use credenciais de teste com permissões mínimas e curta validade.

## 5. Reprodutibilidade: reconstruir, não copiar a máquina

Reprodutibilidade significa que outra pessoa ou pipeline consegue obter um resultado equivalente a partir de entradas declaradas. Não significa que todo byte será sempre idêntico; quando identidade byte a byte for necessária, timestamps, ordem, locale, timezone, arquitetura e versões precisam ser controlados.

O projeto deve declarar a versão do interpretador e das ferramentas, as dependências diretas, as versões resolvidas e os comandos de instalação. Use lockfiles quando o ecossistema oferecer esse mecanismo. Em Python, recrie `.venv` a partir de um arquivo de requisitos ou outro manifesto; em JavaScript, use o lockfile com o modo de instalação apropriado. Não dependa de um pacote instalado manualmente no sistema.

Para imagens Docker em GitHub Actions, a documentação oficial descreve `SOURCE_DATE_EPOCH` como uma variável padronizada para fazer com que timestamps do índice, da configuração e dos metadados reflitam uma época definida. Ela também mostra como usar o timestamp do commit Git como valor [10]. Essa técnica resolve uma fonte específica de não determinismo; não substitui o pinning de imagens-base, o controle de dependências ou o teste do artefato.

A reprodução deve ser testável. Um bom README contém uma sequência curta, por exemplo:

```text
1. instalar a versão de runtime indicada;
2. criar o ambiente isolado;
3. instalar dependências usando o manifesto ou lockfile;
4. copiar `.env.example` para o mecanismo local apropriado e preencher apenas valores de teste;
5. executar lint, testes e build;
6. registrar versões e o commit usado.
```

A IA pode gerar um `Makefile`, `Taskfile`, script ou workflow, mas a pessoa responsável deve conferir caminhos, permissões, plataformas suportadas e efeitos colaterais. Reprodutibilidade não é obtida ao aceitar um script longo porque ele “funcionou uma vez”.

## 6. Como trabalhar com a IA sem abdicar da responsabilidade

Um ciclo recomendado possui cinco momentos:

**Contextualizar.** Informe objetivo, arquivos relevantes, restrições, versão das ferramentas, comando de teste e o que a IA não pode fazer. Remova segredos e dados pessoais.

**Planejar.** Peça uma lista de mudanças, riscos, hipóteses e comandos somente de leitura. Se houver mais de uma interpretação, faça a IA declarar as alternativas antes de editar.

**Alterar em pequena escala.** Peça um patch limitado, sem reformatar arquivos não relacionados. Em operações no terminal, exija o comando exato e uma explicação do efeito, do diretório-alvo e do rollback.

**Verificar.** Leia o diff, consulte o status, execute testes e lint, verifique dependências e procure segredos. Para workflows, revise permissões, entradas não confiáveis, actions de terceiros e logs.

**Registrar.** Faça commits pequenos e descritivos. Atualize documentação e lockfiles quando a alteração exigir. Anote limitações e testes que não puderam ser executados.

Essa separação torna explícita a diferença entre **velocidade de geração** e **responsabilidade técnica**. A IA pode gerar dez alternativas em segundos; ainda cabe à pessoa escolher uma arquitetura aceitável, avaliar segurança, validar comportamento, respeitar licenças, compreender o custo operacional e responder pelo resultado em produção.

## 7. Riscos específicos e limites

O primeiro risco é a execução cega de comandos destrutivos. Uma sugestão com `rm -rf`, `git reset --hard`, `git clean -fdx`, `curl | sh`, `sudo` ou acesso amplo ao Docker pode ser tecnicamente plausível e operacionalmente desastrosa. O segundo é a injeção: entrada de usuário, branch ou issue pode virar código se for concatenada em shell ou workflow. O terceiro é o vazamento de credenciais por prompt, histórico do terminal, logs, artefatos, dumps ou dependências maliciosas. O quarto é a deriva do ambiente: o código funciona no laptop, mas não no CI porque depende de uma versão ou arquivo não declarado. O quinto é a supply chain: uma action ou imagem pode mudar sob uma tag móvel.

A documentação de uso seguro do GitHub recomenda privilégio mínimo, revisão de como secrets são utilizados, rotação de valores expostos e pinning de actions de terceiros em um SHA completo para usar uma versão imutável [4]. O SSDF do NIST organiza a segurança em preparar a organização, proteger o software, produzir software bem protegido e responder a vulnerabilidades; a versão 1.1 acrescenta a prática de implementar e manter ambientes seguros de desenvolvimento [11]. O ponto não é transformar o capítulo em uma checklist universal. É lembrar que ambiente, ferramenta, repositório e pipeline também fazem parte do sistema a ser protegido.

## Padrões recomendados

- **Ambiente declarativo:** README, arquivo de versão, manifesto, lockfile e script de verificação.
- **Shell defensivo:** comandos citados, entradas tratadas como dados, pré-visualização de operações destrutivas e códigos de saída preservados.
- **Git em pequenos passos:** diff revisado, staging seletivo, commits coesos e branch de trabalho.
- **Configuração com escopo:** variáveis não sensíveis documentadas; secrets injetados por mecanismo apropriado; nenhum segredo no prompt ou no log.
- **Reprodução por recriação:** ambientes locais descartáveis, dependências resolvidas e timestamps controlados quando necessário.
- **IA com autoridade limitada:** leitura primeiro, patch pequeno, execução autorizada passo a passo, testes e revisão humana.

## Anti-padrões

- **“Funcionou na minha máquina” como evidência suficiente:** ignora versões, dependências e configurações implícitas.
- **Copiar `.env`, `.venv`, `node_modules` ou caches para o Git:** transforma estado local e possíveis segredos em artefato compartilhado.
- **Colar uma credencial no prompt para “depurar mais rápido”:** cria risco de retenção, exposição e reutilização indevida.
- **Executar o comando da IA sem olhar o diff:** perde a fronteira entre sugestão e ação irreversível.
- **Interpolar entrada externa em shell ou YAML:** abre espaço para injeção de scripts.
- **Usar tags móveis de actions ou imagens sem avaliação:** torna a origem do build mutável.
- **Confiar apenas no mascaramento de logs:** redaction pode falhar para valores transformados, estruturados ou impressos de forma inesperada.
- **Usar `sudo` ou permissões amplas para eliminar erros de ambiente:** aumenta o blast radius e esconde a causa.
- **Usar `git reset --hard` ou `git clean -fdx` como limpeza padrão:** pode destruir trabalho local e artefatos necessários.
- **Aceitar dependências e comandos inventados pela IA sem consulta à documentação:** converte alucinação em mudança operacional.

## Exercício — laboratório de ambiente auditável

Crie um repositório descartável em um diretório temporário. Não use dados reais nem tokens reais.

1. Inicialize o Git e registre as versões de Git, shell e runtime. Crie um README com os comandos de instalação, teste e limpeza.
2. Crie um `.venv` ou o mecanismo de isolamento equivalente, um arquivo de dependências e um `.env.example` com valores fictícios. Coloque `.venv/`, `.env`, caches e artefatos no `.gitignore`.
3. Escreva um script curto que leia `APP_ENV` e `API_BASE_URL`, valide a presença dos nomes obrigatórios e falhe com código diferente de zero sem imprimir os valores. Use aspas e trate a entrada como dados.
4. Peça à IA, sem enviar o `.env`, um plano para adicionar uma verificação de configuração. Exija primeiro o plano e depois um patch mínimo. Registre quais hipóteses a IA fez.
5. Antes de executar qualquer comando proposto, use `pwd`, `git status --short` e leia o comando linha a linha. Recuse ou revise comandos que usem `eval`, `curl | sh`, permissões elevadas ou remoção recursiva sem necessidade.
6. Aplique o patch, execute o teste com valores fictícios, rode `git diff --check`, revise `git diff` e faça staging seletivo com `git add -p`. Confirme que `.env` e `.venv` não aparecem no diff.
7. Simule uma revisão: peça à IA uma lista de riscos, mas confira cada item com a documentação. Faça um commit coeso e escreva no README como recriar o ambiente do zero.
8. Como extensão, crie um workflow de CI sem secrets, com permissões mínimas e uma entrada de branch tratada por variável intermediária. Revise a action usada e, se aplicável, fixe-a em um SHA completo.

**Critérios de conclusão:** outra pessoa consegue recriar o ambiente seguindo o README; o teste falha de maneira observável quando uma configuração obrigatória falta; nenhum segredo ou diretório local foi versionado; o diff contém apenas a mudança intencional; e o relatório do exercício distingue claramente o que a IA gerou do que foi verificado por uma pessoa.

## Referências

[1]: https://docs.python.org/3/library/venv.html "Python Documentation — venv — Creation of virtual environments"
[2]: https://www.gnu.org/software/bash/manual/html_node/Environment.html "GNU Bash Reference Manual — Environment"
[3]: https://www.gnu.org/software/bash/manual/html_node/Quoting.html "GNU Bash Reference Manual — Quoting"
[4]: https://docs.github.com/en/actions/reference/security/secure-use "GitHub Docs — Secure use reference"
[5]: https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F "Pro Git — What is Git?"
[6]: https://git-scm.com/docs/git-config "Git Documentation — git-config"
[7]: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html "OWASP Cheat Sheet Series — Secrets Management Cheat Sheet"
[8]: https://docs.github.com/actions/learn-github-actions/variables "GitHub Docs — Store information in variables"
[9]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets "GitHub Docs — Using secrets in GitHub Actions"
[10]: https://docs.docker.com/build/ci/github-actions/reproducible-builds/ "Docker Docs — Reproducible builds with GitHub Actions"
[11]: https://csrc.nist.gov/projects/ssdf "NIST CSRC — Secure Software Development Framework SSDF"

## Fontes consultadas

As fontes acima foram abertas e lidas por meio de busca, extração de conteúdo e navegador. Foram priorizadas documentações oficiais de Git, GNU Bash, GitHub Actions, Python, Docker e NIST, complementadas pela orientação técnica da OWASP. O relatório usa as fontes para fundamentar afirmações específicas e não trata snippets de busca como evidência suficiente.

**Caveat de escopo:** exemplos de comandos e políticas precisam ser adaptados ao sistema operacional, ao shell, ao ecossistema de linguagem e ao modelo de ameaça do projeto. Nenhum checklist substitui revisão de código, testes, threat modeling, gestão de incidentes ou responsabilidade técnica.
