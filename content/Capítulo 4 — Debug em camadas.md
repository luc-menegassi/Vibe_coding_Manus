# Capítulo 4 — Debug em camadas

## Tese

**Depurar com responsabilidade é reduzir sistematicamente o espaço de causas possíveis até obter evidência suficiente para explicar e reproduzir o defeito.** A velocidade de uma IA para gerar código, testes ou comandos não substitui a responsabilidade técnica de definir o sintoma, escolher testes discriminantes, proteger dados, avaliar efeitos colaterais e confirmar a correção. No Vibe Coding, a IA deve acelerar a investigação e a instrumentação; não deve ser tratada como autoridade que “adivinha” a causa.

Este capítulo usa “camadas” como um método de isolamento, não como uma arquitetura universal. A ordem exata depende do sistema, mas uma investigação típica verifica, da borda para o núcleo e do processo para o ambiente: cliente e interface; contrato HTTP ou de mensageria; aplicação e domínio; persistência e cache; dependências externas e rede; processo, runtime e container; pipeline e infraestrutura; versão e mudança recente. Em cada fronteira, o objetivo é separar observação de hipótese e testar uma variável por vez.

## 1. Comece pelo sintoma observável

Antes de editar código, transforme a reclamação em uma afirmação testável. Registre:

- **Comportamento esperado:** o que deveria ocorrer e para qual usuário, entrada ou operação.
- **Comportamento observado:** resposta, erro, latência, dado incorreto ou ausência de efeito.
- **Escopo:** quais versões, ambientes, contas, regiões, endpoints ou tipos de dados são afetados.
- **Tempo e frequência:** quando começou, se é intermitente e qual a taxa aproximada.
- **Reprodução mínima:** os passos, dados e pré-condições necessários para repetir o problema.
- **Oracle do teste:** o critério objetivo que classifica uma execução como correta ou incorreta.

“Está quebrado” não é um oracle. “A requisição `POST /pedidos` com um item válido retorna 201 em até dois segundos e grava exatamente um pedido” é uma hipótese operacionalmente testável. A especificação evita que a IA otimize para uma interpretação vaga ou para a simples eliminação da mensagem de erro.

A primeira pergunta não é “qual linha está errada?”, mas **em qual camada o sintoma aparece e em qual fronteira ele muda de estado?** Um erro no navegador pode ser produzido por um contrato incompatível, por uma exceção no domínio, por uma consulta lenta ou por uma indisponibilidade externa. O texto da mensagem, isoladamente, não prova a camada causal.

## 2. Colete evidência sem aumentar o risco

A investigação deve começar com observações de baixo impacto. Preserve horário, fuso, versão do commit, configuração efetiva, identificador de requisição, entrada sanitizada, resposta, status e ambiente. Evite “tentar qualquer coisa” diretamente em produção ou alterar dados para testar uma hipótese.

### Logs úteis e seguros

A recomendação da OWASP é projetar o logging de acordo com o risco e registrar informação suficiente para análise posterior. Uma entrada deve responder, de forma apropriada ao contexto, **quando, onde, quem e o quê** aconteceu. Eventos úteis incluem falhas de validação de entrada e saída, autenticação, autorização, sessão, erros de aplicação, conectividade, alterações de configuração e atividades de maior risco.[3]

Um log de diagnóstico deve ser estruturado e legível por máquinas. Um exemplo mínimo é:

```json
{
  "timestamp": "2025-04-10T14:32:11.832Z",
  "level": "error",
  "event": "order_creation_failed",
  "service": "orders-api",
  "version": "a1b2c3d",
  "environment": "staging",
  "request_id": "req-7f3",
  "trace_id": "tr-9a1",
  "route": "POST /orders",
  "error_class": "TimeoutError",
  "dependency": "payments",
  "duration_ms": 3004
}
```

O exemplo não registra token, senha, corpo completo do pedido nem dados de pagamento. A OWASP orienta remover, mascarar, sanitizar, hashear ou criptografar segredos, identificadores de sessão, senhas, chaves, strings de conexão e dados pessoais que o sistema de logging não deveria armazenar.[3] Também recomenda proteger permissões e localização dos logs e separar detalhes extensos, como stack traces, quando isso reduzir exposição e facilitar controle de acesso.[3]

Logs com mais verbosidade não são automaticamente melhores. Ative debug de forma temporária, com escopo e retenção definidos. Verifique se o aumento de volume não degrada o sistema e se o mecanismo não pode ser desligado a ponto de eliminar eventos necessários para segurança ou conformidade.[3]

### Logs de automação e containers

No GitHub Actions, quando os logs normais não bastam, `ACTIONS_STEP_DEBUG=true` aumenta a verbosidade dos passos e `ACTIONS_RUNNER_DEBUG=true` acrescenta arquivos sobre o processo do runner e do worker.[2] A documentação também informa que segredos têm precedência sobre variáveis de mesmo nome e que quem pode reexecutar um workflow pode habilitar diagnósticos na reexecução.[2] Isso torna a opção útil para uma execução controlada, mas exige revisar a saída para não expor valores sensíveis.

Para containers, `docker logs` recupera os logs disponíveis no momento da execução; `--follow` acompanha novas linhas, `--timestamps` adiciona timestamps e `--since`/`--until` recortam uma janela temporal.[5] Esse comando é um ponto de observação, não uma prova completa do estado interno: ele só mostra o que o container e o driver de logging disponibilizaram. Se a aplicação não emite um evento, métrica ou trace sobre uma decisão, o comando não consegue reconstruí-la.

## 3. Relacione logs, métricas e traces

Observabilidade não é “ter muitos logs”. O OpenTelemetry define sinais complementares: métricas são agregações numéricas ao longo do tempo; logs são mensagens timestamped; spans representam unidades de trabalho; traces encadeiam spans para mostrar o caminho de uma requisição por serviços.[4] Uma métrica pode revelar que a taxa de erro subiu, um trace pode mostrar que o tempo foi gasto no pagamento e um log correlacionado pode explicar a exceção concreta.

Use identificadores de correlação estáveis, como `request_id` e `trace_id`, atravessando gateway, aplicação, fila e dependências. Em sistemas distribuídos, o trace responde “onde a requisição passou e quanto durou cada etapa”; o log responde “qual evento detalhado ocorreu”; a métrica responde “com que frequência e em que escala”. Essa triangulação evita concluir, por exemplo, que o banco é a causa apenas porque a API devolveu 500.

Instrumente antes da crise sempre que possível. O primer do OpenTelemetry observa que uma aplicação está adequadamente instrumentada quando não é necessário alterar o código durante o incidente para obter a informação essencial.[4] Instrumentação tardia, adicionada só depois da falha, pode alterar o timing e deixar o defeito intermitente ainda mais difícil de reproduzir.

## 4. Isole por camadas e fronteiras

Trate cada camada como uma hipótese com uma observação correspondente. O teste deve distinguir hipóteses; repetir o mesmo teste com mais detalhes não é progresso.

### 4.1 Cliente e interface

Confirme a entrada enviada, o método, a URL, os headers relevantes, o estado local e a interpretação da resposta. Compare uma chamada mínima reproduzível com a interação da interface. Se a chamada direta funciona e a tela falha, a suspeita desloca-se para serialização, estado, cache do cliente ou contrato de apresentação. Não conclua que “o frontend está errado” sem comparar bytes, status e timing.

### 4.2 Contrato e camada de transporte

Verifique esquema, autenticação, autorização, códigos de status, timeout, retries, idempotência e limites de tamanho. Um teste de contrato pode demonstrar que cliente e servidor discordam sobre um campo obrigatório antes de executar o domínio. Em mensagens assíncronas, confirme publicação, consumo, ack, ordenação e reentrega.

### 4.3 Aplicação e domínio

Execute a regra com uma entrada mínima e conhecida, isolando efeitos externos quando o objetivo for testar lógica. Valide invariantes: uma operação idempotente não cria duplicatas; uma transição inválida é rejeitada; uma resposta não anuncia sucesso antes da persistência necessária. Unit tests verificam regras locais, mas não demonstram que o sistema completo respeita rede, serialização ou configuração.

### 4.4 Persistência e cache

Verifique conexão, schema, migrações, transação, isolamento, índices, concorrência e invalidação de cache. Compare a leitura no banco com a leitura pelo serviço. Uma consulta que funciona isoladamente pode falhar sob timeout, lock ou plano diferente. Ao testar, use dados descartáveis e não aplique comandos destrutivos sugeridos por uma IA sem revisão humana e backup adequado.

### 4.5 Dependências externas e rede

Distingua timeout, erro de DNS, falha TLS, rejeição por autorização, resposta inválida e erro de negócio do provedor. Reproduza com um stub ou sandbox quando possível, mas registre que o stub não prova o comportamento real. Testes de retry devem verificar limite, backoff e idempotência; retry ilimitado pode transformar uma falha localizada em sobrecarga.

### 4.6 Processo, runtime, container e infraestrutura

Compare versão do runtime, variáveis de ambiente, filesystem, permissões, memória, CPU, relógio, DNS e limites. Reproduza a mesma imagem e configuração em ambiente controlado. Diferencie “processo vivo” de “serviço correto”: um container pode permanecer em execução enquanto todas as requisições falham.

### 4.7 Histórico e mudança

Quando a regressão está limitada a um intervalo de versões, use `git bisect`. A documentação oficial descreve uma busca binária que começa com um commit conhecido como `bad` e outro anterior conhecido como `good`, testa um commit intermediário e reduz o intervalo até localizar a primeira mudança problemática.[1]

```bash
git bisect start HEAD v1.4.0
git bisect bad
# executar o teste e marcar cada checkout:
git bisect good   # comportamento correto
git bisect bad    # comportamento incorreto
git bisect reset
```

Se houver um teste automatizável, `git bisect run ./test-regression.sh` pode executar a classificação. O script deve retornar 0 para o estado correto, 1–127 para o estado incorreto, exceto 125; o código 125 indica que aquele commit não pode ser testado e deve ser ignorado.[1] Commits pulados próximos ao culpado podem impedir que o Git determine exatamente o primeiro commit ruim.[1] Portanto, o resultado de `bisect` localiza um candidato sob o oracle e o ambiente usados; ele não substitui revisão causal da mudança.

## 5. Trabalhe com uma IA de programação sem terceirizar o diagnóstico

A IA é mais útil quando recebe contexto verificável e uma tarefa de investigação limitada. Forneça o sintoma, o oracle, as versões, o trecho mínimo de código, logs sanitizados, passos de reprodução e o que já foi descartado. Peça uma saída que separe:

1. hipóteses ordenadas por evidência;
2. observação que confirmaria ou refutaria cada hipótese;
3. teste mínimo e reversível;
4. riscos do teste;
5. mudança proposta somente depois de localizar a camada.

Um prompt responsável é: “Dado este comportamento reproduzível e estes logs sem segredos, proponha até três hipóteses. Para cada uma, indique a camada, o teste discriminante, o resultado esperado e o que não podemos concluir. Não altere arquivos nem execute comandos destrutivos.”

Depois, execute o teste em ambiente apropriado, leia o diff inteiro, revise dependências e confirme o resultado com um teste de regressão. Peça à IA para gerar instrumentação ou um teste, mas verifique se o logging respeita minimização de dados, se a asserção realmente captura o bug e se o teste não passa por acaso. A pessoa responsável deve decidir quando a evidência é suficiente para mudar o código e quando deve escalar o incidente.

A IA pode inventar APIs, confundir sintoma com causa, sugerir apagar cache ou dados, mascarar um erro com retry, expor segredos no log ou fixar apenas o caminho feliz. Ela também tende a favorecer a hipótese fornecida no prompt. Para reduzir esse risco, peça explicitamente hipóteses alternativas, registre evidências contra e a favor e faça revisão por uma pessoa com conhecimento do sistema.

## 6. Feche o ciclo

Uma correção aceitável precisa passar por quatro verificações. Primeiro, o teste que falhava passa com o mesmo oracle. Segundo, testes de regressão cobrem o mecanismo causal e não apenas a mensagem apresentada. Terceiro, a mudança não quebra contratos, segurança, performance ou operação. Quarto, logs, métricas e traces tornam o próximo diagnóstico possível sem ativar instrumentação improvisada.

Documente a linha do tempo, o sintoma, a camada isolada, a causa sustentada por evidência, a correção, os testes executados, os dados não coletados por segurança e as incertezas restantes. “Build verde” prova apenas que o conjunto de verificações executado terminou como esperado; não prova ausência de defeitos, segurança ou confiabilidade operacional.

## Exercício prático: localizar uma falha intermitente em camadas

Considere um serviço de pedidos em Docker. O navegador às vezes mostra “falha ao finalizar”, a API retorna 500 e o banco contém pedidos duplicados em alguns casos. O workflow do GitHub Actions passou, mas o problema ocorre em produção. O repositório possui dez commits desde a última versão conhecida como estável.

1. Escreva o comportamento esperado, o comportamento observado, o escopo, a frequência e um oracle que identifique duplicação.
2. Gere uma requisição mínima reproduzível com um `request_id` único. Capture a resposta e use `docker logs --timestamps --since 15m api` para coletar somente a janela relevante. Remova tokens, dados pessoais e corpos de pagamento antes de compartilhar qualquer evidência.
3. Instrumente ou consulte a telemetria para correlacionar a requisição entre API, banco e serviço de pagamento. Compare logs, taxa de erros e duração dos spans. Classifique a falha como contrato, domínio, persistência, dependência, runtime ou combinação.
4. Faça três testes discriminantes: repetir com uma chave idempotente, chamar o serviço de pagamento em sandbox e executar a regra de criação com a dependência simulada. Para cada teste, registre qual hipótese ele confirma ou enfraquece.
5. Se o oracle for automatizável, crie um script que retorne 0 quando exatamente um pedido for criado, 1 quando houver duplicação e 125 quando o commit não puder ser testado. Execute `git bisect` no intervalo conhecido e registre o log da sessão.
6. Peça à IA duas hipóteses alternativas e um teste para cada uma. Não aceite alteração de código antes de revisar os comandos e o diff. Depois de localizar a causa, adicione um teste de regressão, valide retries e idempotência e confirme que a telemetria não expõe segredos.

O relatório do exercício deve terminar com uma frase causal verificável, por exemplo: “A duplicação ocorre porque a reexecução após timeout não é idempotente; o teste X reproduz o efeito, o trace Y mostra duas gravações e a correção Z faz a segunda tentativa retornar o mesmo resultado.” Se a evidência não sustentar essa frase, mantenha a hipótese como não confirmada.

## Referências

[1]: https://git-scm.com/docs/git-bisect "Git — git-bisect Documentation"

[2]: https://docs.github.com/actions/managing-workflow-runs/enabling-debug-logging "GitHub Actions — Enabling debug logging"

[3]: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html "OWASP — Logging Cheat Sheet"

[4]: https://opentelemetry.io/docs/concepts/observability-primer/ "OpenTelemetry — Observability primer"

[5]: https://docs.docker.com/reference/cli/docker/container/logs/ "Docker — docker container logs"

## Fontes consultadas

As cinco páginas acima foram abertas e lidas integralmente ou nas seções relevantes. As fontes combinam documentação oficial do Git, GitHub Actions, OpenTelemetry e Docker com a orientação técnica da OWASP. O capítulo não usa snippets de busca como evidência.
