---
title: "DaemonSet no Kubernetes: executando um Pod por nó"
description: Entenda quando usar um DaemonSet e aprenda a criar um manifesto com Node Exporter para disponibilizar métricas dos nós do cluster.
date: 2026-08-04
category: Kubernetes
tags: [kubernetes, daemonset, pods, node-exporter, prometheus, monitoramento, yaml]
---

Um agente de monitoramento precisa acompanhar cada máquina do cluster. Se adicionarmos um novo nó, esse agente também precisa chegar até ele.

O **DaemonSet** atende a esse tipo de necessidade. A partir das anotações de 04/08/2026, vamos entender seu funcionamento e montar um exemplo com o Node Exporter.

## O que é um DaemonSet?

O DaemonSet é um controlador que mantém uma cópia de um Pod em cada nó elegível. Quando novos nós elegíveis entram no cluster, ele cria Pods para eles; quando nós são removidos, os Pods correspondentes também são removidos.

A expressão **nó elegível** é importante: seletores, afinidade e taints podem limitar onde os Pods serão executados. Por isso, um DaemonSet pode atender todos os nós ou apenas um grupo deles. [Documentação oficial de DaemonSets](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/).

## Quando utilizar?

As anotações destacam três aplicações:

| Necessidade | Exemplos |
| --- | --- |
| Métricas e coleta de logs por nó | Prometheus Node Exporter e Fluentd |
| Componentes de rede distribuídos pelos nós | kube-proxy e agentes de soluções como Calico ou Flannel |
| Observação de segurança por nó | Falco e agentes Sysdig |

Cada ferramenta tem sua própria configuração de instalação. O manifesto deste artigo é um exemplo de estudo com Node Exporter.

## DaemonSet e Deployment

No [post sobre Deployments](/posts/entendendo-deployments/), vimos o gerenciamento de réplicas de uma aplicação. No DaemonSet, a quantidade desejada acompanha os nós elegíveis, sem um campo `replicas`.

Considere um cluster em que todos os nós sejam elegíveis:

```text
3 nós → 3 Pods do DaemonSet
4 nós → 4 Pods do DaemonSet

node-1 → node-exporter
node-2 → node-exporter
node-3 → node-exporter
node-4 → node-exporter (criado após a entrada do novo nó)
```

Esse desenho representa o estado desejado após a reconciliação. A criação e a prontidão dos Pods ainda dependem das condições do cluster.

## Criando o manifesto

O rascunho das anotações apresenta um DaemonSet chamado `node-exporter-daemonset`, a porta `9100` e os diretórios `/proc` e `/sys` do host.

O exemplo abaixo completa essa estrutura. Salve como `node-exporter-daemonset.yaml`:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter-daemonset
  labels:
    app: node-exporter-daemonset
spec:
  selector:
    matchLabels:
      app: node-exporter-daemonset
  template:
    metadata:
      labels:
        app: node-exporter-daemonset
    spec:
      nodeSelector:
        kubernetes.io/os: linux
      hostNetwork: true
      hostPID: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: node-exporter
          image: quay.io/prometheus/node-exporter:v1.9.1
          args:
            - --path.procfs=/host/proc
            - --path.sysfs=/host/sys
            - --path.rootfs=/host/root
          ports:
            - name: metrics
              containerPort: 9100
              hostPort: 9100
          volumeMounts:
            - name: proc
              mountPath: /host/proc
              readOnly: true
            - name: sys
              mountPath: /host/sys
              readOnly: true
            - name: root
              mountPath: /host/root
              readOnly: true
              mountPropagation: HostToContainer
      volumes:
        - name: proc
          hostPath:
            path: /proc
            type: Directory
        - name: sys
          hostPath:
            path: /sys
            type: Directory
        - name: root
          hostPath:
            path: /
            type: Directory
```

### Entendendo a configuração

O `selector.matchLabels` corresponde às labels de `template.metadata`. Já `template.spec` descreve o Pod que será criado em cada nó selecionado.

O `nodeSelector` restringe o exemplo a Linux. Não adicionamos tolerations para os taints do control plane; esses nós podem ficar fora da execução.

O Node Exporter compartilha a rede e o namespace de processos do host por meio de `hostNetwork` e `hostPID`. Os volumes disponibilizam os diretórios da máquina em caminhos próprios dentro do container, e os argumentos `--path.*` apontam o exporter para esses caminhos. A montagem da raiz complementa o rascunho para a coleta de informações dos sistemas de arquivos. [Documentação do Node Exporter](https://github.com/prometheus/node_exporter).

A imagem usa uma versão fixa para tornar o exemplo reproduzível. A porta `9100` precisa estar disponível nos nós; com a rede do host, o endpoint também depende das regras de acesso à máquina. Políticas do cluster podem restringir `hostPath` e o compartilhamento de namespaces.

## Aplicando e conferindo

Com o `kubectl` configurado para o cluster de laboratório, execute:

```bash
kubectl apply -f node-exporter-daemonset.yaml
kubectl rollout status daemonset/node-exporter-daemonset
kubectl get daemonset node-exporter-daemonset
kubectl get pods -l app=node-exporter-daemonset -o wide
```

Confira a coluna `NODE` dos Pods para observar sua distribuição. No resumo do DaemonSet, compare `DESIRED`, `CURRENT` e `READY`: eles ajudam a identificar se todos os Pods esperados foram criados e estão prontos.

Se algum Pod não iniciar, consulte sua descrição e os eventos:

```bash
kubectl describe daemonset node-exporter-daemonset
kubectl describe pod <nome-do-pod>
kubectl logs <nome-do-pod>
```

Para consultar as métricas de um Pod em execução, em um terminal use:

```bash
kubectl port-forward pod/<nome-do-pod> 19100:9100
```

Em outro terminal:

```bash
curl http://localhost:19100/metrics
```

Esse teste consulta diretamente um exporter. Para coletar e armazenar as métricas continuamente, ainda é necessário configurar o Prometheus. O manifesto não instala esse serviço.

Os comandos são uma proposta de prática a partir das anotações; as imagens não incluem saídas de execução desse laboratório.

## Conclusão

O DaemonSet permite acompanhar a distribuição dos nós com agentes locais de métricas, logs, rede ou segurança. No exemplo, o template reúne a configuração necessária para executar o Node Exporter e consultar suas métricas.

## Referências

- [Kubernetes — DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) — documentação oficial sobre funcionamento, seleção de nós e configuração de DaemonSets.
- [Prometheus — Node Exporter](https://github.com/prometheus/node_exporter) — documentação do exporter de métricas e de sua execução em containers.
- [LINUXtips — PICK](https://linuxtips.io/pick/) — Programa Intensivo de Containers e Kubernetes utilizado como base dos meus estudos e destas anotações.
