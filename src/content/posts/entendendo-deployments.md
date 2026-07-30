---
title: Entendendo Deployments no Kubernetes - o recurso que mantém sua aplicação sempre disponível
description: Entenda o que é um Deployment, como ele funciona e por que ele é o recurso recomendado para executar aplicações no Kubernetes.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, pods, replicaset, kubectl, yaml, devops]
series: Fundamentos de Deployments no Kubernetes
part: 1
totalParts: 8
---

# Entendendo Deployments no Kubernetes: o recurso que mantém sua aplicação sempre disponível

> Muita gente responde que um **Deployment** é apenas um recurso para criar Pods. Mas essa resposta está incompleta.

Quando começamos a estudar Kubernetes, normalmente criamos Pods diretamente para entender como tudo funciona.

Isso é ótimo para aprender.

Mas não é assim que aplicações normalmente são executadas em ambientes reais.

Na prática, quase sempre utilizamos **Deployments**.

Neste artigo vamos entender:

- o que é um Deployment;
- por que ele existe;
- como ele controla os Pods;
- a relação entre Deployment, ReplicaSet e Pods;
- como criar o primeiro Deployment.



# O que é um Deployment?

Um **Deployment** é um recurso do **Kubernetes** responsável por criar, atualizar e administrar Pods automaticamente.

Em vez de você criar Pods manualmente, você informa ao Kubernetes qual é o estado desejado da aplicação.

Depois disso, o Deployment trabalha para manter esse estado.

Por exemplo.

Imagine que sua aplicação deve possuir **3 Pods** executando a imagem do NGINX.

Você não precisa criar os três Pods manualmente.

Basta criar um Deployment dizendo que deseja três réplicas.

O Kubernetes fará todo o restante.



# O problema de criar Pods diretamente

Um Pod pode morrer.

Pode ser removido.

Pode falhar durante uma atualização.

Quando criamos um Pod diretamente, somos nós os responsáveis por recriá-lo.

Ou seja, não existe gerenciamento automático.

Já o Deployment observa constantemente o estado da aplicação.

Se algum Pod desaparecer, ele será recriado automaticamente.



# Como o Deployment funciona internamente?

Apesar de parecer que o Deployment controla diretamente os Pods, isso não acontece.

Na verdade existe outro recurso entre eles.

```text
Deployment
      │
      ▼
 ReplicaSet
      │
      ▼
    Pods
```

O fluxo funciona da seguinte maneira.

- O Deployment administra um ReplicaSet.
- O ReplicaSet garante a quantidade correta de Pods.
- Os Pods executam os containers da aplicação.

Essa separação permite que o Kubernetes realize atualizações, rollback e escalabilidade sem interromper o gerenciamento da aplicação.



# Um exemplo simples

Imagine que desejamos executar três Pods do NGINX.

```text
Objetivo desejado

3 Pods executando nginx
```

Criamos um Deployment informando isso.

Se um dos Pods morrer, o ReplicaSet perceberá imediatamente.

```text
Antes

Pod 1 ✅
Pod 2 ✅
Pod 3 ❌
```

O ReplicaSet cria outro automaticamente.

```text
Depois

Pod 1 ✅
Pod 2 ✅
Pod 3 ✅
```

Perceba que o Deployment continua mantendo exatamente o estado que definimos.



# Criando um Deployment

Um Deployment é definido através de um manifesto YAML.

Um exemplo simples seria:

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx-deployment

spec:
  replicas: 3

  selector:
    matchLabels:
      app: nginx

  template:
    metadata:
      labels:
        app: nginx

    spec:
      containers:
        - name: nginx
          image: nginx:latest
```

Mesmo sendo pequeno, esse manifesto já é suficiente para criar uma aplicação gerenciada pelo Kubernetes.

Nos próximos artigos da série iremos detalhar cada uma dessas seções.



# Aplicando o manifesto

Depois de salvar o arquivo como `deployment.yaml`, basta executar:

```bash
kubectl apply -f deployment.yaml
```

Explicando o comando:

- `kubectl` → cliente do Kubernetes.
- `apply` → cria ou atualiza recursos.
- `-f` → informa que será utilizado um arquivo.
- `deployment.yaml` → manifesto do Deployment.

Resultado esperado:

```text
deployment.apps/nginx-deployment created
```



# Verificando os recursos criados

Primeiro podemos listar os Deployments.

```bash
kubectl get deployments
```

Resultado esperado:

```text
NAME               READY   UP-TO-DATE   AVAILABLE
nginx-deployment   3/3     3            3
```

Depois podemos verificar o ReplicaSet.

```bash
kubectl get replicasets
```

Resultado esperado:

```text
NAME                          DESIRED   CURRENT   READY
nginx-deployment-xxxxxxxxxx   3         3         3
```

Por fim, verificamos os Pods.

```bash
kubectl get pods
```

Resultado esperado:

```text
NAME                                READY
nginx-deployment-xxxxxxxxxx-abc12   1/1
nginx-deployment-xxxxxxxxxx-def34   1/1
nginx-deployment-xxxxxxxxxx-ghi56   1/1
```

Observe que o Deployment criou automaticamente um ReplicaSet, que por sua vez criou os Pods.



# Entendendo a saída do Deployment

Ao executar:

```bash
kubectl get deployments
```

Algumas colunas são exibidas.

| Coluna | Significado |
|--------|-------------|
| READY | Quantos Pods estão prontos |
| UP-TO-DATE | Quantos Pods utilizam a versão atual |
| AVAILABLE | Quantos Pods estão disponíveis para receber tráfego |
| AGE | Tempo desde a criação do Deployment |

Essas informações ajudam a acompanhar rapidamente a saúde da aplicação.


# Deployment x Pod

Essa é uma dúvida bastante comum.

| Pod | Deployment |
|------|------------|
| Executa um ou mais containers | Gerencia vários Pods |
| Não realiza rollback | Permite rollback |
| Não faz atualização gradual | Faz Rolling Update |
| Não recria Pods automaticamente | Mantém a aplicação no estado desejado |
| Indicado para testes | Indicado para aplicações |

Uma analogia simples.

```text
Pod
↓

Funcionário
```

```text
Deployment
↓

Gerente
```

O funcionário executa o trabalho.

O gerente garante que sempre exista alguém executando o trabalho.

Se um funcionário faltar, outro assume seu lugar.

É exatamente essa ideia que o Deployment aplica aos Pods.



# Conclusão

O Deployment é um dos recursos mais importantes do Kubernetes.

Ele simplifica o gerenciamento da aplicação e permite que o cluster mantenha automaticamente o estado desejado.

Além de criar Pods, ele também é responsável por permitir atualizações, escalabilidade, rollback e alta disponibilidade.

Entender bem esse recurso facilita bastante o aprendizado dos próximos conceitos do Kubernetes.

No próximo artigo da série vamos aprofundar a estrutura de um Deployment e entender o papel do **ReplicaSet**, do **selector** e do **template**, além de explicar por que esses campos precisam estar corretamente configurados.



## Referências

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — documentação oficial sobre Deployments.
- [Kubernetes Documentation — ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/) — funcionamento do ReplicaSet.
- [Kubernetes Documentation — Deploy a Stateless Application](https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/) — exemplo oficial de Deployment.
- [LINUXtips — Descomplicando Kubernetes](https://linuxtips.io/) — treinamento utilizado como base para os estudos desta série.
