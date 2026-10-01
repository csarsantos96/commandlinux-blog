---
title: "Liveness Probe no Kubernetes: verificando e reiniciando containers"
description: Aprenda a configurar uma livenessProbe TCP no Nginx, entender seus parâmetros e observar reinícios e CrashLoopBackOff ao testar uma porta incorreta.
date: 2026-10-01
category: Kubernetes
tags: [kubernetes, liveness-probe, probes, nginx, containers, troubleshooting]
---

Um container pode estar em execução e, mesmo assim, a aplicação dentro dele deixar de responder.

Neste laboratório vamos configurar uma **Liveness Probe** no Nginx e alterar a porta da verificação para observar como o Kubernetes reage a uma falha.

## As probes são configuradas por container

As probes ficam na configuração de cada container dentro do Pod.

Se um Pod possui dois containers e queremos verificar os dois, precisamos definir uma probe para cada um deles. Uma falha na liveness de um container aciona o reinício daquele container.

Neste exemplo teremos um Deployment com uma réplica e um container Nginx.

## Entendendo os parâmetros

Vamos utilizar a seguinte configuração:

```yaml
livenessProbe:
  tcpSocket:
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

| Campo | Função no exemplo |
| --- | --- |
| `tcpSocket` | Tenta estabelecer uma conexão TCP na porta 80. |
| `initialDelaySeconds` | Espera 10 segundos após o início do container antes de começar as verificações. |
| `periodSeconds` | Define um intervalo de 10 segundos entre as verificações. |
| `timeoutSeconds` | Define o tempo máximo de 5 segundos para cada verificação. |
| `failureThreshold` | Após 3 falhas consecutivas, considera a liveness malsucedida e aciona o reinício. |

O `timeoutSeconds` não define uma espera antes de tentar novamente. Se a conexão for recusada imediatamente, a verificação pode falhar antes dos 5 segundos.

Já o `failureThreshold` não limita o total de reinícios: ele define quantas falhas consecutivas são necessárias para provocar cada reinício. [Documentação oficial sobre configuração de probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/).

## Criando o Deployment

Crie o arquivo `nginx-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-deployment
  template:
    metadata:
      labels:
        app: nginx-deployment
    spec:
      containers:
        - name: nginx
          image: nginx:1.19.1
          resources:
            limits:
              cpu: "0.5"
              memory: 256Mi
            requests:
              cpu: "0.25"
              memory: 128Mi
          livenessProbe:
            tcpSocket:
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
```

Mantivemos a imagem utilizada nas anotações para reproduzir o laboratório. O bloco `requests` fica no mesmo nível de indentação que `limits`, ambos dentro de `resources`.

Aplique o manifesto:

```bash
kubectl apply -f nginx-deployment.yaml
```

Consulte os Pods do Deployment:

```bash
kubectl get pods -l app=nginx-deployment
```

Na execução registrada nas anotações, o Pod iniciou sem reinícios:

```text
NAME                              READY   STATUS    RESTARTS   AGE
nginx-deployment-5dd8fbcb6c-cl7zh   1/1     Running   0          25s
```

Os nomes e tempos podem variar no seu cluster.

## Conferindo a probe com describe

Use o nome retornado no comando anterior:

```bash
kubectl describe pod nginx-deployment-5dd8fbcb6c-cl7zh
```

Na seção do container, observe:

```text
Restart Count: 0
Liveness: tcp-socket :80 delay=10s timeout=5s period=10s ##success=1 ##failure=3
```

Esses campos mostram o contador de reinícios e a configuração aplicada à liveness.

## Provocando uma falha na porta 81

Para testar, altere somente a porta da probe no manifesto:

```yaml
livenessProbe:
  tcpSocket:
    port: 81
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

O Nginx desse laboratório continua escutando na porta 80. Alterar a probe não altera a porta da aplicação.

Reaplique o arquivo e acompanhe os Pods:

```bash
kubectl apply -f nginx-deployment.yaml
kubectl get pods -l app=nginx-deployment 
```

A alteração no template do Deployment inicia uma atualização e cria um novo Pod. Por isso, consulte novamente o nome antes de executar o `describe`.

No registro do laboratório, o novo Pod já apresentava dois reinícios:

```text
NAME                               READY   STATUS    RESTARTS       AGE
nginx-deployment-5565dfc44d-zmf5q    1/1     Running   2 (39s ago)    119s
```

## Identificando a causa nos eventos

Inspecione o novo Pod:

```bash
kubectl describe pod nginx-deployment-5565dfc44d-zmf5q
```

Nas anotações, a seção `Events` registrou:

```text
Warning  Unhealthy  Liveness probe failed: dial tcp 10.244.1.16:81: connect: connection refused
Normal   Killing    Container nginx failed liveness probe, will be restarted
```

A primeira mensagem mostra que a conexão com a porta 81 foi recusada. A segunda confirma que a falha da liveness provocou o reinício do container.

Como a configuração continua apontando para a porta incorreta, o problema se repete após cada reinício.

## Observando o CrashLoopBackOff

Depois de várias tentativas, o laboratório apresentou:

```text
NAME                               READY   STATUS             RESTARTS      AGE
nginx-deployment-5565dfc44d-zmf5q    0/1     CrashLoopBackOff   5 (7s ago)    4m7s
```

Nesse contexto, o `CrashLoopBackOff` indica que o container está passando por reinícios repetidos, com uma espera antes da próxima tentativa. O `describe` ajuda a identificar a causa: neste teste, a porta incorreta da liveness.

## Corrigindo o teste

Volte a porta da probe para `80` no arquivo e aplique novamente:

```bash
kubectl apply -f nginx-deployment.yaml
kubectl rollout status deployment/nginx-deployment
kubectl get pods -l app=nginx-deployment
```

Confira o novo Pod com `kubectl describe pod <nome-do-pod>` e acompanhe o contador de reinícios para verificar a recuperação.

## O que a verificação TCP comprova?

Uma probe TCP bem-sucedida indica que foi possível abrir uma conexão na porta configurada. Ela não valida todas as funcionalidades da aplicação.

Para aplicações que precisam de uma verificação mais específica, uma probe HTTP pode consultar um endpoint de saúde. Aplicações com inicialização demorada também podem utilizar uma `startupProbe` antes das verificações de liveness. [Documentação oficial sobre probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/).

## Conclusão

Neste laboratório configuramos uma liveness TCP na porta 80, conferimos seus parâmetros com `describe` e provocamos uma falha ao mudar a verificação para a porta 81.

Os eventos e o contador de reinícios mostraram a reação do Kubernetes. O teste também evidenciou que uma configuração incorreta da probe pode provocar reinícios contínuos, mesmo quando o processo da aplicação está em execução.

---

## Referências

- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)
- [Kubernetes — Liveness, Readiness, and Startup Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
- [LINUXtips — Kubernetes Essentials](https://linuxtips.io/treinamento/kubernetes-essentials/) — curso utilizado como base dos meus estudos e desta série de anotações.
