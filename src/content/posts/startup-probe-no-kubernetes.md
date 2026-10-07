---
title: "Startup Probe no Kubernetes: dando tempo para a aplicação iniciar"
description: Entenda a startupProbe, sua relação com liveness e readiness e pratique com uma aplicação Nginx que demora para iniciar.
date: 2026-10-05
category: Kubernetes
tags: [kubernetes, startup-probe, probes, nginx, containers, troubleshooting]
---

> **Nota:** Este conteúdo foi produzido a partir das minhas anotações de aula no **PICK – Programa Intensivo de Containers e Kubernetes**, da LINUXtips, complementadas pela documentação oficial do Kubernetes.

Algumas aplicações precisam de tempo para carregar configurações ou preparar arquivos antes de começar a responder. Uma verificação de saúde que começa cedo demais pode interromper esse processo.

A **Startup Probe** permite definir uma verificação específica para a inicialização. Nas anotações de 05/10/2026, ela aparece com verificações HTTP e TCP.

## O que a Startup Probe verifica?

A `startupProbe` verifica se o container passou no teste de inicialização configurado. Enquanto ela não tiver sucesso, as probes de liveness e readiness desse container não são executadas.

Após o primeiro sucesso, a startup deixa de ser executada naquela execução do container. Se o container reiniciar, o processo começa novamente. Atingir o limite de falhas provoca sua interrupção; em um Deployment, ele será reiniciado conforme a política `Always`. [Documentação sobre probes e ciclo de vida](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes).

Portanto, a anotação de que ela é testada “uma única vez” se refere à etapa de inicialização: podem ocorrer várias tentativas até passar ou atingir o limite.

## Comparando as três probes

| Probe | Pergunta que orienta a configuração | Efeito da falha |
| --- | --- | --- |
| Startup | A aplicação concluiu a inicialização? | Ao atingir o limite, interrompe o container. |
| Liveness | A aplicação continua saudável? | Ao atingir o limite, interrompe o container. |
| Readiness | A aplicação está pronta para receber tráfego? | Afeta a prontidão do Pod para os Services. |

Os artigos sobre [Liveness Probe](/posts/liveness-probe-no-kubernetes/) e [Readiness Probe](/posts/readiness-probe-no-kubernetes/) detalham as outras duas verificações.

## Parâmetros da startupProbe

```yaml
startupProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 0
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 24
```

| Campo | Configuração do exemplo |
| --- | --- |
| `httpGet` | Consulta `/` na porta `80` do Pod. |
| `initialDelaySeconds` | Não acrescenta uma espera inicial. |
| `periodSeconds` | Configura intervalos de 5 segundos. |
| `timeoutSeconds` | Limita cada tentativa a 2 segundos. |
| `failureThreshold` | Permite até 24 falhas consecutivas. |

O produto `24 × 5` representa um orçamento aproximado de 120 segundos para inicializar, não um cronômetro exato. O `successThreshold` da startup deve ser `1`. [Documentação dos parâmetros](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

## Laboratório: Nginx com inicialização demorada

Para tornar a espera visível, o exemplo acrescenta um `sleep 30` antes de iniciar o Nginx. Salve como `nginx-startup-probe.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-startup-probe
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-startup-probe
  template:
    metadata:
      labels:
        app: nginx-startup-probe
    spec:
      containers:
        - name: nginx
          image: nginx:1.28.0
          command: ["/bin/sh", "-c"]
          args:
            - sleep 30; exec nginx -g 'daemon off;'
          ports:
            - name: http
              containerPort: 80
          startupProbe:
            httpGet:
              path: /
              port: http
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 24
          livenessProbe:
            httpGet:
              path: /
              port: http
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: http
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 3
```

A espera ocorre dentro do container observado. Usar um init container para esse atraso não demonstraria o mesmo comportamento, pois ele executaria antes do container Nginx.

### Aplicando e observando

```bash
kubectl apply -f nginx-startup-probe.yaml
kubectl get pods -l app=nginx-startup-probe -w
```

Encerre o acompanhamento com `Ctrl+C`. Depois, consulte o nome do Pod e seus eventos:

```bash
kubectl get pods -l app=nginx-startup-probe
kubectl describe pod <nome-do-pod>
kubectl rollout status deployment/nginx-startup-probe
```

Durante o `sleep`, esperamos que a startup encontre a porta ainda fechada. Quando o Nginx iniciar e responder, ela poderá passar, liberando as demais verificações. Observe `READY` e `RESTARTS` para conferir o resultado.

### Provocando uma falha

No manifesto, altere somente a porta da `startupProbe` para `81` e reaplique:

```bash
kubectl apply -f nginx-startup-probe.yaml
kubectl get pods -l app=nginx-startup-probe -w
```

O Nginx continuará escutando na porta `80`. Consulte o novo Pod com `describe` para acompanhar as falhas e, após o limite, o reinício. Repetições podem resultar em `CrashLoopBackOff`.

Volte a porta para `http` e aplique o manifesto novamente para recuperar o exemplo. Ao terminar:

```bash
kubectl delete -f nginx-startup-probe.yaml
```

Essas etapas são uma prática proposta a partir das anotações; as fotos não registram a execução desse manifesto.

## Alternativa com TCP

Para verificar apenas a abertura de uma porta, substitua o bloco `httpGet` da startup por:

```yaml
tcpSocket:
  port: 80
```

Escolha um único mecanismo por probe. A conexão TCP comprova que a porta aceita conexões; um endpoint HTTP pode representar uma condição mais específica da aplicação.

## Conclusão

A Startup Probe cria uma etapa própria para a inicialização, permitindo manter verificações de liveness e readiness adequadas à aplicação depois que ela começa a responder.

## Referências

- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) — configuração e parâmetros das probes.
- [Kubernetes — Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes) — probes, estados e reinícios dos containers.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Programa Intensivo de Containers e Kubernetes utilizado como base dos meus estudos e destas anotações.
