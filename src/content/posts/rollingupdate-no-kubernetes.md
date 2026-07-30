---
title: "RollingUpdate no Kubernetes: atualizando aplicações sem indisponibilidade"
description: Entenda como funciona a estratégia RollingUpdate e aprenda a configurar maxSurge e maxUnavailable para atualizar aplicações com segurança.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, rollingupdate, maxsurge, maxunavailable, rollout, devops]
series: Fundamentos de Deployments no Kubernetes
part: 5
totalParts: 8
---

# RollingUpdate no Kubernetes: atualizando aplicações sem indisponibilidade

> Como o Kubernetes consegue atualizar uma aplicação sem derrubar todos os Pods de uma vez?

Essa é uma das maiores vantagens de utilizar um **Deployment**.

Quando alteramos uma imagem, adicionamos recursos ou modificamos qualquer configuração do manifesto, o Kubernetes não remove todos os Pods imediatamente.

Em vez disso, ele faz uma atualização gradual.

Essa estratégia recebe o nome de **RollingUpdate**.

Neste artigo vamos entender como ela funciona e o papel dos parâmetros **maxSurge** e **maxUnavailable**.



# O que é RollingUpdate?

O **RollingUpdate** é a estratégia padrão utilizada pelos Deployments.

Seu objetivo é substituir os Pods antigos pelos novos aos poucos.

Assim, a aplicação continua disponível durante praticamente toda a atualização.

Visualmente o processo acontece assim.

```text
Antes

Pod 1 (v1)
Pod 2 (v1)
Pod 3 (v1)
Pod 4 (v1)

        │

RollingUpdate

        ▼

Pod 1 (v2)
Pod 2 (v2)
Pod 3 (v2)
Pod 4 (v2)
```

Em vez de remover todos os Pods antigos, o Kubernetes faz essa troca gradualmente.



# Configurando a estratégia

Dentro do Deployment encontramos o campo `strategy`.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 2
```

Nesse trecho estamos dizendo ao Kubernetes como desejamos realizar a atualização.

Os dois parâmetros mais importantes são:

- `maxSurge`
- `maxUnavailable`

Vamos entender cada um deles.



# O que é maxSurge?

O **maxSurge** define quantos Pods extras podem existir temporariamente durante uma atualização.

Imagine um Deployment com:

```text
10 Pods
```

Se configurarmos:

```yaml
maxSurge: 1
```

Durante a atualização o Kubernetes poderá criar:

```text
10 Pods antigos
+
1 Pod novo
=
11 Pods
```

Esses Pods extras existem apenas durante o RollingUpdate.

Depois da atualização, o Deployment volta para a quantidade desejada.



# O que é maxUnavailable?

O **maxUnavailable** define quantos Pods podem ficar indisponíveis durante a atualização.

Por exemplo.

```yaml
maxUnavailable: 2
```

Com um Deployment contendo dez réplicas.

```text
10 Pods
```

O Kubernetes poderá remover até dois Pods antes de criar novos.

Assim teremos:

```text
8 Pods disponíveis

2 Pods sendo substituídos
```

Ou seja.

Mesmo durante a atualização, pelo menos oito Pods continuarão respondendo às requisições.



# Entendendo o processo passo a passo

Vamos imaginar novamente um Deployment com dez réplicas.

```text
Estado inicial

10 antigos
0 novos
```

Com:

```yaml
maxSurge: 1
maxUnavailable: 2
```

O Kubernetes começa criando um novo Pod.

```text
10 antigos

1 novo

Total = 11 Pods
```

Agora ele pode remover até dois Pods antigos.

```text
8 antigos

1 novo

Total = 9 Pods
```

Como surgiram duas vagas, ele cria mais dois Pods novos.

```text
8 antigos

3 novos

Total = 11 Pods
```

Depois remove mais Pods antigos.

Cria novos novamente.

E continua repetindo esse processo até que todos estejam utilizando a nova versão.



# Visualizando o RollingUpdate

O comportamento pode ser representado assim.

```text
10 antigos

↓

11 Pods
(10 antigos + 1 novo)

↓

9 Pods
(8 antigos + 1 novo)

↓

11 Pods
(8 antigos + 3 novos)

↓

...

↓

10 Pods novos
```

Essa atualização acontece automaticamente.

Na maioria dos casos, os usuários nem percebem que a aplicação foi atualizada.



# Aplicando uma atualização

Depois de alterar o manifesto.

```yaml
image: nginx:1.31.0
```

Aplicamos novamente.

```bash
kubectl apply -f deployment.yaml
```

Resultado esperado:

```text
deployment.apps/nginx-deployment configured
```

Nesse momento o RollingUpdate começa.



# Acompanhando a atualização

Enquanto o Deployment está sendo atualizado, podemos observar os Pods.

```bash
kubectl get pods -n giropops
```

Resultado esperado:

```text
NAME                            READY

nginx-xxxxx                     Running

nginx-yyyyy                     Terminating

nginx-zzzzz                     Running
```

Você verá Pods antigos sendo encerrados enquanto novos Pods aparecem.



# Acompanhando o rollout

Existe um comando específico para acompanhar o progresso da atualização.

```bash
kubectl rollout status deployment \
    -n giropops \
    nginx-deployment
```

Explicando:

- `rollout status` → acompanha a atualização.
- `deployment` → tipo do recurso.
- `-n giropops` → Namespace.
- `nginx-deployment` → nome do Deployment.

Resultado esperado:

```text
Waiting for deployment...

deployment "nginx-deployment" successfully rolled out
```

Esse comando é muito utilizado durante implantações em produção.



# Quando alterar maxSurge?

Um valor maior faz a atualização terminar mais rapidamente.

Entretanto.

Também consome mais recursos do cluster.

Exemplo.

```yaml
maxSurge: 3
```

Nesse caso o Kubernetes poderá criar até três Pods extras durante o processo.

Isso reduz o tempo de atualização.

Mas exige mais CPU e memória.



# Quando alterar maxUnavailable?

Esse parâmetro controla a disponibilidade mínima da aplicação.

Quanto maior esse número.

Mais rápida tende a ser a atualização.

Por outro lado.

Menos Pods permanecerão atendendo usuários.

Em aplicações críticas normalmente esse valor costuma ser baixo.



# Resumo

```text
RollingUpdate

│

├── Atualiza aos poucos

├── Evita indisponibilidade

├── Cria Pods novos

├── Remove Pods antigos

└── Mantém a aplicação disponível
```

Já os dois parâmetros funcionam assim.

| Parâmetro | Função |
|----------|--------|
| `maxSurge` | Quantidade máxima de Pods extras durante a atualização |
| `maxUnavailable` | Quantidade máxima de Pods indisponíveis durante a atualização |



# Conclusão

O RollingUpdate é uma das funcionalidades mais importantes dos Deployments.

Ele permite atualizar aplicações praticamente sem interromper o serviço.

Combinando corretamente **maxSurge** e **maxUnavailable**, conseguimos controlar o equilíbrio entre velocidade da atualização e disponibilidade da aplicação.

No próximo artigo vamos conhecer a estratégia **Recreate**, entender como ela funciona e descobrir em quais cenários ela ainda faz sentido, mesmo causando um período de indisponibilidade.



## Referências

- [Kubernetes Documentation – Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Rolling Update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [Kubernetes Documentation – Update a Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
