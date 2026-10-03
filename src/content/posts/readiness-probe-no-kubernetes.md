---
title: "Readiness Probe no Kubernetes: quando Running não significa pronto"
description: Entenda como a Readiness Probe sinaliza se um container está pronto para receber tráfego e veja esse comportamento em uma demonstração com Nginx.
date: 2026-10-02
category: Kubernetes
tags: [kubernetes, readiness-probe, probes, nginx, containers, troubleshooting]
---

> **Nota:** Este conteúdo foi produzido a partir das minhas anotações de aula no **PICK – Programa Intensivo de Containers e Kubernetes**, da LINUXtips, complementadas pela documentação oficial do Kubernetes.

Um Pod aparecer como `Running` não significa que a aplicação dentro dele já esteja pronta para receber requisições.

O processo pode estar em execução enquanto a aplicação carrega configurações, inicializa componentes ou aguarda uma dependência necessária para atender os usuários.

A **Readiness Probe** permite que o Kubernetes acompanhe essa prontidão. Para entender seu papel, vamos observar uma demonstração com Nginx: primeiro com a verificação passando e depois com uma falha intencional.

## O que a Readiness Probe verifica?

A readiness é uma verificação configurada por container que sinaliza se ele está pronto para atender requisições.

Quando um container deixa de estar pronto, isso afeta a condição `Ready` do Pod. No encaminhamento normal de um Service que seleciona esse Pod, ele deixa de ser considerado um destino pronto para receber tráfego. As verificações continuam, permitindo detectar quando a aplicação volta a estar disponível.

Esse comportamento ajuda a evitar que requisições sejam encaminhadas para uma aplicação que ainda está inicializando ou que está temporariamente incapaz de atendê-las. [Documentação oficial sobre readiness](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

A qualidade dessa sinalização depende do teste escolhido. Uma resposta bem-sucedida na página inicial do Nginx demonstra que aquela página respondeu; em uma aplicação real, um endpoint de prontidão pode verificar as condições necessárias para atender requisições.

## Readiness e liveness têm funções diferentes

No [post sobre Liveness Probe](/posts/liveness-probe-no-kubernetes/), vimos como uma falha na verificação de saúde pode provocar o reinício de um container.

A readiness tem outra finalidade: sinalizar se ele pode receber tráfego naquele momento.

| Probe | O que sinaliza | Efeito da falha |
| --- | --- | --- |
| `livenessProbe` | Se o container passa no teste de saúde definido. | Pode provocar o reinício do container. |
| `readinessProbe` | Se o container está pronto para atender requisições. | Afeta a prontidão do Pod. |

Uma falha de readiness, por si só, não reinicia o container. Essa diferença aparece claramente na demonstração: o Nginx continua em execução, mas o Pod deixa de estar pronto.

## Como a verificação é definida

Nas anotações, um dos exemplos usa uma requisição HTTP:

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 8
  successThreshold: 2
  failureThreshold: 3
```

Nesse caso, o kubelet consulta o caminho `/` na porta `80` do Pod. Os demais campos definem os tempos e a quantidade de resultados consecutivos usados para avaliar a prontidão.

| Campo | Significado no exemplo |
| --- | --- |
| `initialDelaySeconds: 10` | Espera inicial de 10 segundos após o início do container. |
| `periodSeconds: 10` | Intervalo configurado de 10 segundos entre verificações. |
| `timeoutSeconds: 8` | Tempo máximo de 8 segundos para cada tentativa. |
| `successThreshold: 2` | Dois sucessos consecutivos para considerar a probe bem-sucedida após uma falha. |
| `failureThreshold: 3` | Três falhas consecutivas para considerar a probe malsucedida após ter passado. |

O timeout limita a duração de uma tentativa; ele não representa uma pausa antes da próxima. Se a conexão for recusada imediatamente, a tentativa pode falhar antes desse limite.

Enquanto o container não está pronto, a readiness pode ser executada com maior frequência que o intervalo configurado. Um container com readiness configurada começa sem prontidão e precisa passar na verificação. [Documentação dos parâmetros](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

## A demonstração com Nginx

No registro do laboratório, o Deployment tinha uma réplica de Nginx com duas verificações: uma liveness HTTP na porta `80` e uma readiness que executava `curl` dentro do container.

O trecho responsável pela readiness era:

```yaml
readinessProbe:
  exec:
    command:
      - curl
      - -f
      - http://localhost:80/
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
  successThreshold: 1
```

Aqui, `exec` executa o comando dentro do container, e `localhost` se refere à rede do próprio Pod. O teste depende de o `curl` estar disponível na imagem e retornar código de saída `0`. A opção `-f` faz respostas HTTP de erro, como `404` e `500`, resultarem em falha do comando.

Esse exemplo usa timeout de 5 segundos e um sucesso para reconhecer a recuperação, enquanto o exemplo HTTP anterior usa 8 segundos e dois sucessos. São configurações diferentes do mesmo mecanismo de prontidão.

Com a URL apontando para a porta em que o Nginx respondia, a consulta dos Pods registrou:

```text
NAME                                               READY   STATUS    RESTARTS   AGE
nginx-deployment-readiness-probe-5654bc46b5-hz6nd    1/1     Running   0          15s
```

O `1/1` indica que o único container estava pronto. O `Running` mostra a fase do Pod, e `RESTARTS 0` informa que não houve reinícios.

O registro de `describe` também confirmou a prontidão e as duas probes:

```text
Ready:          True
Restart Count:  0
Liveness:       http-get http://:80/ delay=10s timeout=5s period=10s #success=1 #failure=3
Readiness:      exec [curl -f http://localhost:80/] delay=10s timeout=5s period=10s #success=1 #failure=3
```

## O que acontece quando a readiness falha?

Para demonstrar a diferença entre execução e prontidão, a URL da readiness foi alterada para uma porta em que o Nginx não estava escutando:

```yaml
exec:
  command:
    - curl
    - -f
    - http://localhost:81/
```

A aplicação continuou na porta `80`, e a liveness continuou verificando essa porta. Somente o destino da readiness passou a ser `81`.

Como essa mudança ocorreu no template do Deployment, um novo Pod foi criado. No registro, mesmo depois de cinco minutos, ele continuava sem prontidão:

```text
NAME                                               READY   STATUS    RESTARTS   AGE
nginx-deployment-readiness-probe-5654bc46b5-hz6nd    1/1     Running   0          20m
nginx-deployment-readiness-probe-778d697956-8jq7h    0/1     Running   0          5m10s
```

O novo Pod apresenta exatamente o comportamento que queremos observar: **`Running`, `READY 0/1` e nenhum reinício**.

O Nginx pode continuar respondendo na porta correta enquanto a readiness falha por consultar a porta errada. Isso também demonstra que uma probe mal configurada pode sinalizar falta de prontidão mesmo quando o processo está funcionando.

As saídas registradas nas anotações mostram esse estado, mas não incluem os eventos de falha do novo Pod. Esses eventos seriam a evidência para confirmar o erro específico encontrado pela probe.

## Por que o Pod antigo continuou aparecendo?

Mesmo com uma réplica desejada, dois Pods podem existir temporariamente durante um RollingUpdate.

O Deployment pode criar um novo Pod e manter o antigo disponível enquanto aguarda que a nova versão fique pronta. Na demonstração, o antigo aparece com `1/1`, enquanto o novo permanece com `0/1`.

Esse comportamento mostra como a prontidão também participa das atualizações: enquanto o novo Pod não fica pronto, o rollout não consegue concluir normalmente. [Documentação de Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/).

## O efeito sobre o tráfego

Se um Service selecionasse esses Pods, o antigo ainda pronto poderia continuar atendendo, enquanto o novo ficaria fora do encaminhamento normal de tráfego.

A demonstração registrada nas anotações inclui o Deployment e os estados dos Pods, mas não um Service nem um teste de requisições. O efeito sobre o tráfego explica a finalidade da readiness, mas não foi medido nessas saídas.

A prontidão também não bloqueia o acesso direto ao IP do Pod. Ela orienta a seleção de destinos prontos pelo Service, que possui opções específicas como `publishNotReadyAddresses` para publicar endereços mesmo sem prontidão. [Documentação de Services](https://kubernetes.io/docs/concepts/services-networking/service/).

Quando a verificação volta a passar, o container pode recuperar a prontidão conforme o `successThreshold`. No exemplo com `exec`, um sucesso basta para reconhecer essa recuperação.

## Conclusão

Estas anotações da aula no PICK mostram como a Readiness Probe participa da avaliação de prontidão dos containers.

A Readiness Probe permite que o Kubernetes diferencie uma aplicação em execução de uma aplicação pronta para receber requisições.

Na demonstração, a porta incorreta fez o novo Pod permanecer com `READY 0/1`, mesmo estando `Running` e sem reinícios. Esse resultado evidencia o papel da readiness: sinalizar prontidão e ajudar a controlar quais Pods devem atender tráfego.

Por isso, escolher uma verificação que represente a prontidão da aplicação e configurar corretamente seus parâmetros é essencial para evitar que um Pod receba requisições antes de poder atendê-las.

1. **Liveness:** “A aplicação está funcionando?” Se falhar repetidamente, o container é reiniciado.
2. **Readiness:** “A aplicação está pronta para receber tráfego?” Se falhar, o Pod deixa de receber tráfego pelos Services, mas o container continua rodando.

## Referências

- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) — explica as probes e seus parâmetros.
- [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — documenta as atualizações e a disponibilidade dos Pods.
- [Kubernetes — Services](https://kubernetes.io/docs/concepts/services-networking/service/) — apresenta o encaminhamento de tráfego para os Pods.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Programa Intensivo de Containers e Kubernetes utilizado como base dos meus estudos e destas anotações.
