---
title: Anatomia de um Deployment entendendo selector, template e ReplicaSet
description: Entenda como um Deployment é estruturado e descubra o papel do selector, template e ReplicaSet na criação e gerenciamento dos Pods.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, replicaset, selector, labels, yaml, pods, devops]
series: Fundamentos de Deployments no Kubernetes
part: 2
totalParts: 8
---

# Anatomia de um Deployment: entendendo selector, template e ReplicaSet
> Muita gente copia um manifesto de Deployment da internet e ele simplesmente funciona. Mas você realmente sabe por que cada campo existe?


No artigo anterior entendemos o que é um **Deployment** e como ele mantém a aplicação no estado desejado.

Agora chegou o momento de abrir esse manifesto e entender como ele funciona por dentro.

Neste artigo vamos detalhar os campos mais importantes do Deployment e entender por que eles precisam estar corretamente configurados.



# Como um Deployment encontra seus Pods?

Quando um Deployment é criado, ele precisa saber exatamente quais Pods pertencem àquela aplicação.

Para isso existe o campo **selector**.

O selector funciona como um filtro.

Ele procura Pods que possuam uma determinada Label.

Sem esse mecanismo o Deployment não saberia quais Pods deve controlar.



# O papel das Labels

As **Labels** são pares de chave e valor adicionados aos recursos do Kubernetes.

Exemplo:

```yaml
labels:
  app: nginx-deployment
```

Nesse exemplo, qualquer recurso que possuir a Label:

```text
app=nginx-deployment
```

poderá ser localizado pelo Deployment.

É exatamente isso que torna o gerenciamento possível.



# Entendendo o selector

Dentro do manifesto encontramos:

```yaml
selector:
  matchLabels:
    app: nginx-deployment
```

O significado é simples.

```text
"Kubernetes,
quero controlar todos os Pods
que possuem:

app=nginx-deployment"
```

Sempre que um Pod possuir essa Label, ele será considerado pertencente ao Deployment.



# O template dos Pods

Outro campo extremamente importante é o **template**.

É nele que fica o "molde" utilizado para criar novos Pods.

```yaml
template:
  metadata:
    labels:
      app: nginx-deployment

  spec:
    containers:
      - name: nginx
        image: nginx:1.30.4
```

Pense no template como uma fábrica.

Toda vez que um novo Pod precisar ser criado, o ReplicaSet utilizará esse modelo.



# A relação entre selector e template

Esses dois campos trabalham juntos.

```text
Deployment
     │
     │ cria
     ▼
ReplicaSet
     │
     │ usa o template
     ▼
Novo Pod
     │
     │ recebe Labels
     ▼
app=nginx-deployment
     ▲
     │
selector encontra o Pod
```

É justamente por isso que as Labels do template devem ser compatíveis com o selector.

Caso contrário o Deployment não conseguirá localizar os Pods que ele mesmo criou.



# Estrutura completa do Deployment

Agora que conhecemos cada parte, o manifesto começa a fazer muito mais sentido.

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: nginx-deployment

spec:
  replicas: 3

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
          image: nginx:1.30.4
```

Observe que o valor utilizado em `matchLabels` é exatamente o mesmo utilizado dentro do template.

Essa correspondência é obrigatória.



# Adicionando limites de recursos

O template também define como os containers serão executados.

Podemos, por exemplo, definir Requests e Limits.

```yaml
containers:
  - name: nginx
    image: nginx:1.30.4

    resources:
      limits:
        cpu: "800m"
        memory: "256Mi"

      requests:
        cpu: "300m"
        memory: "64Mi"
```

Assim, todos os Pods criados por esse Deployment já nascerão com essas configurações.



# Aplicando o Deployment

Depois de criar ou alterar o manifesto, basta aplicar novamente.

```bash
kubectl apply -f deployment.yaml
```

Resultado esperado:

```text
deployment.apps/nginx-deployment configured
```

O comando `apply` cria o recurso caso ele não exista.

Se ele já existir, apenas aplica as mudanças necessárias.



# Visualizando o manifesto gerado

Uma forma muito útil de estudar Deployments é visualizar como o Kubernetes armazenou aquele recurso.

```bash
kubectl get deployment nginx-deployment -o yaml
```

Explicando os parâmetros:

- `get` → obtém um recurso.
- `deployment` → tipo do recurso.
- `nginx-deployment` → nome do Deployment.
- `-o yaml` → exibe a saída em formato YAML.

Resultado esperado:

```text
apiVersion: apps/v1
kind: Deployment
metadata:
...
spec:
...
status:
...
```

Essa saída contém diversas informações adicionadas automaticamente pelo Kubernetes.

É uma excelente ferramenta para estudar.



# Listando apenas os Pods daquele Deployment

Como todos os Pods possuem a mesma Label, podemos filtrá-los.

```bash
kubectl get pods -l app=nginx-deployment
```

Explicando:

- `get pods` → lista Pods.
- `-l` → aplica um filtro por Label.
- `app=nginx-deployment` → mostra apenas Pods dessa aplicação.

Resultado esperado:

```text
NAME                                  READY
nginx-deployment-xxxx-yyyy1           1/1
nginx-deployment-xxxx-yyyy2           1/1
nginx-deployment-xxxx-yyyy3           1/1
```

Esse é um comando muito utilizado no dia a dia.



# Todo Deployment cria um ReplicaSet?

Sim.

Sempre que criamos um Deployment, automaticamente um ReplicaSet também é criado.

Podemos verificar isso com:

```bash
kubectl get replicasets
```

Resultado esperado:

```text
NAME                           DESIRED   READY
nginx-deployment-7b7df8dcb7    3         3
```

Na maioria das vezes você não cria ReplicaSets manualmente.

O próprio Deployment faz esse trabalho.



# Resumo

Podemos resumir toda a estrutura do Deployment da seguinte maneira.

```text
Deployment
│
├── selector
│      │
│      └── encontra Pods
│
├── template
│      │
│      └── define como serão criados
│
└── ReplicaSet
       │
       └── mantém a quantidade correta de Pods
```

Cada uma dessas peças possui uma responsabilidade diferente.

Juntas, elas permitem que o Kubernetes mantenha sua aplicação funcionando continuamente.



# Conclusão

Agora que entendemos a estrutura de um Deployment, fica muito mais fácil compreender os próximos recursos.

Sabemos quem cria os Pods.

Sabemos quem os encontra.

E sabemos quem garante que eles continuem existindo.

No próximo artigo da série vamos aprender as diferentes formas de criar um Deployment utilizando tanto manifestos YAML quanto o comando `kubectl create deployment`, além de entender quando cada abordagem faz mais sentido.



## Referências

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — documentação oficial sobre Deployments.
- [Kubernetes Documentation — Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) — funcionamento de Labels e Selectors.
- [Kubernetes Documentation — ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/) — gerenciamento de réplicas.
- [LINUXtips — Descomplicando Kubernetes](https://linuxtips.io/) — treinamento utilizado como base para esta série.
