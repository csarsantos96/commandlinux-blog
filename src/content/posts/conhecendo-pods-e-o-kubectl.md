---
title: Conhecendo os Pods e o kubectl
description: Entenda o que são os Pods, como o kubectl funciona e como criar seus primeiros recursos no Kubernetes utilizando manifestos YAML.
date: 2026-07-20
category: Kubernetes
tags: [kubernetes, kubectl, pods, yaml, containers, devops]
series: Fundamentos de Kubernetes
part: 1
totalParts: 4
---

# Conhecendo os Pods e o kubectl

Quando começamos a estudar Kubernetes, uma das primeiras dúvidas que surgem é:

> Afinal, o que é um Pod?

Muita gente responde que um Pod é um container, mas essa resposta não está correta.

Na realidade, o **Pod é a menor unidade que o Kubernetes gerencia**. Sempre que criamos uma aplicação dentro de um cluster, o Kubernetes cria um Pod, e dentro dele existirão um ou mais containers.

Esse conceito é extremamente importante, pois praticamente todos os recursos do Kubernetes trabalham em cima dos Pods.

Neste artigo vamos conhecer os Pods, entender como o `kubectl` funciona e criar nosso primeiro recurso utilizando manifestos YAML.



# O que é um Pod?

O Pod é a menor unidade de execução do Kubernetes.

Ele funciona como uma espécie de "casa" para um ou mais containers.

Em vez do Kubernetes administrar containers individualmente, ele administra Pods.

Podemos representar isso da seguinte forma:

```text
Kubernetes
      │
      ▼
+------------------------+
|          Pod           |
|                        |
|  +------------------+  |
|  |    Container     |  |
|  +------------------+  |
+------------------------+
```

Na maioria dos casos existe apenas um container dentro do Pod.

Entretanto, isso não é uma regra.

Também é possível executar diversos containers dentro do mesmo Pod.


# Containers dentro do mesmo Pod

Quando existem dois ou mais containers em um mesmo Pod, todos eles compartilham diversos recursos.

Entre eles:

- o mesmo endereço IP;
- a mesma interface de rede;
- as mesmas portas;
- volumes de armazenamento;
- o mesmo ciclo de vida.

Isso significa que dois containers pertencentes ao mesmo Pod conseguem se comunicar utilizando apenas `localhost`.

Imagine o seguinte cenário:

```text
+--------------------------------+
|              Pod               |
|                                |
|  +-----------+  +-----------+  |
|  |  Nginx    |  | BusyBox   |  |
|  | Porta 80  |  | curl      |  |
|  +-----------+  +-----------+  |
+--------------------------------+
```

O container BusyBox consegue acessar o Nginx utilizando:

```bash
curl localhost:80
```

Isso acontece porque ambos compartilham a mesma pilha de rede.

# Sidecar Containers

Embora seja comum encontrarmos apenas um container por Pod, existem diversos cenários onde faz sentido executar múltiplos containers.

Esse padrão é conhecido como **Sidecar Pattern**.

Imagine uma aplicação principal e um container responsável apenas por enviar logs para uma plataforma de observabilidade.

```text
Pod
│
├── Aplicação
│
└── Agente de Logs
```

Os dois containers trabalham juntos.

Se o Pod for removido, ambos serão encerrados ao mesmo tempo.

Por isso dizemos que compartilham o mesmo ciclo de vida.

# O Kubernetes gerencia Pods, não Containers

Esse detalhe costuma gerar bastante confusão.

Quando executamos um comando como:

```bash
kubectl run corinthians --image=nginx
```

Parece que estamos criando apenas um container.

Na prática, o Kubernetes cria um Pod chamado **corinthians**, e dentro dele existe um container utilizando a imagem do Nginx.

Essa diferença fica mais clara quando observamos o manifesto YAML gerado pelo Kubernetes.

Veremos isso mais adiante.

# Conhecendo o kubectl

O `kubectl` é o cliente oficial do Kubernetes.

É através dele que enviamos comandos para o cluster.

Sempre que executamos um comando, o `kubectl` conversa com o API Server do Kubernetes.

O fluxo acontece da seguinte forma.

```text
            kubectl
               │
               ▼
         Kubernetes API
               │
               ▼
         Control Plane
               │
               ▼
          Worker Nodes
               │
               ▼
              Pods
```

Ou seja, o `kubectl` nunca conversa diretamente com um Worker Node.

Toda comunicação acontece através da API do Kubernetes.

# Criando nosso primeiro Pod

Uma das maneiras mais rápidas de criar um Pod é utilizando o comando `kubectl run`.

```bash
kubectl run corinthians --image=nginx
```

Vamos entender esse comando.

- `kubectl` é o cliente do Kubernetes.
- `run` solicita a criação de um Pod.
- `corinthians` será o nome do Pod.
- `--image=nginx` informa qual imagem será utilizada pelo container.

Após alguns segundos podemos verificar se o recurso foi criado.

```bash
kubectl get pods
```

Resultado esperado:

```text
NAME          READY   STATUS    RESTARTS   AGE
corinthians   1/1     Running   0          5s
```

O comando `kubectl get` fornece uma visão rápida dos recursos existentes no cluster.

Cada coluna possui um significado.

| Coluna | Descrição |
|--------|-----------|
| NAME | Nome do Pod |
| READY | Quantidade de containers prontos |
| STATUS | Estado atual do Pod |
| RESTARTS | Quantidade de reinicializações |
| AGE | Tempo desde a criação |

Esse costuma ser o primeiro comando utilizado durante uma análise de problemas em um cluster Kubernetes.

# Obtendo mais detalhes

Enquanto o `kubectl get` apresenta apenas um resumo, o comando `describe` exibe todas as informações do recurso.

```bash
kubectl describe pod corinthians
```

Entre as informações exibidas estão:

- nome;
- namespace;
- labels;
- endereço IP;
- imagem utilizada;
- portas;
- eventos;
- condições;
- volumes;
- nó onde o Pod está sendo executado.

Na prática, sempre que algo não estiver funcionando corretamente, a combinação abaixo será uma das primeiras ferramentas utilizadas.

```bash
kubectl get pods

kubectl describe pod corinthians
```

Esses dois comandos já fornecem informações suficientes para identificar boa parte dos problemas encontrados durante o gerenciamento de Pods.

No próximo artigo da série vamos aprender como gerar manifestos YAML utilizando `kubectl run --dry-run=client`, entender a estrutura de um arquivo YAML e descobrir por que praticamente todos os ambientes de produção utilizam recursos declarativos em vez de comandos imperativos.

## Referências

- [Kubernetes — Pods](https://kubernetes.io/pt-br/docs/concepts/workloads/pods/) — documenta o principal objeto abordado neste artigo.
- [Kubernetes — Referência do kubectl](https://kubernetes.io/docs/reference/kubectl/) — documenta os comandos de gerenciamento e inspeção do cluster.
- [Kubernetes — kubectl run](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_run/) — referência oficial para a criação imperativa de Pods.
- [LINUXtips — Kubernetes Essentials](https://linuxtips.io/treinamento/kubernetes-essentials/) — curso utilizado como base dos meus estudos e desta série de anotações.
