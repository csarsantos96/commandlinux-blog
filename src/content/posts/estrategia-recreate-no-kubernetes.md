---
title: "Estratégia Recreate no Kubernetes: quando derrubar todos os Pods faz sentido"
description: Entenda como funciona a estratégia Recreate, quando utilizá-la e quais são suas diferenças em relação ao RollingUpdate.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, recreate, rollingupdate, rollout, strategy, devops]
series: Fundamentos de Deployments no Kubernetes
part: 6
totalParts: 8
---

# Estratégia Recreate no Kubernetes: quando derrubar todos os Pods faz sentido

> "O RollingUpdate sempre é a melhor estratégia." Na maioria das vezes, sim. Mas existem cenários em que utilizar o **Recreate** é a escolha mais segura.

Nos artigos anteriores vimos como o **RollingUpdate** atualiza uma aplicação sem interromper completamente o serviço.

Entretanto, nem todas as aplicações suportam duas versões executando ao mesmo tempo.

Nesses casos existe outra estratégia chamada **Recreate**.

Neste artigo vamos entender como ela funciona, quando utilizá-la e quais são suas vantagens e desvantagens.

---

# O que é a estratégia Recreate?

O **Recreate** é uma estratégia de atualização disponível nos Deployments.

Ao contrário do RollingUpdate, ela não cria Pods novos enquanto os antigos ainda estão executando.

O processo acontece em duas etapas.

1. Todos os Pods antigos são removidos.
2. Somente depois os novos Pods são criados.

Visualmente:

```text
Versão 1

Pod 1
Pod 2
Pod 3
Pod 4

        │

Todos os Pods são removidos

        ▼

Nenhum Pod disponível

        ▼

Pod 1 (v2)
Pod 2 (v2)
Pod 3 (v2)
Pod 4 (v2)
```

Durante esse intervalo existe indisponibilidade da aplicação.

---

# Comparando com RollingUpdate

A diferença entre as duas estratégias fica muito clara.

## RollingUpdate

```text
Pods antigos

↓

Pods antigos + Pods novos

↓

Pods novos
```

Sempre existe pelo menos uma parte da aplicação disponível.

---

## Recreate

```text
Pods antigos

↓

Nenhum Pod

↓

Pods novos
```

Existe uma interrupção temporária do serviço.

---

# Configurando a estratégia

Dentro do Deployment basta alterar o campo `strategy`.

Antes:

```yaml
strategy:
  type: RollingUpdate
```

Depois:

```yaml
strategy:
  type: Recreate
```

Observe que não existe o bloco `rollingUpdate`.

Isso acontece porque os parâmetros `maxSurge` e `maxUnavailable` pertencem exclusivamente ao RollingUpdate.

---

# Aplicando a alteração

Depois de modificar o manifesto.

```bash
kubectl apply -f deployment.yaml
```

Resultado esperado:

```text
deployment.apps/nginx-deployment configured
```

O próximo rollout utilizará a estratégia Recreate.

---

# O que acontece durante a atualização?

Imagine um Deployment com quatro Pods.

```text
Pod A
Pod B
Pod C
Pod D
```

Ao alterar a imagem da aplicação.

```yaml
image: nginx:1.31.0
```

E executar:

```bash
kubectl apply -f deployment.yaml
```

O Kubernetes fará o seguinte.

```text
Remover

Pod A
Pod B
Pod C
Pod D
```

Depois:

```text
Criar

Pod A (novo)
Pod B (novo)
Pod C (novo)
Pod D (novo)
```

Não existe convivência entre as duas versões.

---

# Acompanhando a atualização

Durante a atualização podemos observar os Pods.

```bash
kubectl get pods -n giropops
```

Resultado esperado:

```text
NAME    READY

Nenhum recurso encontrado.
```

Alguns segundos depois.

```text
NAME                        READY

nginx-deployment-xxxxx      1/1

nginx-deployment-yyyyy      1/1

nginx-deployment-zzzzz      1/1
```

É exatamente essa ausência temporária de Pods que caracteriza o Recreate.

---

# Quando utilizar Recreate?

Apesar de causar indisponibilidade, essa estratégia ainda é muito utilizada.

Principalmente quando não é permitido executar duas versões simultaneamente.

Alguns exemplos.

- Aplicações legadas.
- Sistemas que bloqueiam acesso concorrente.
- Aplicações incompatíveis entre versões.
- Atualizações que modificam completamente estruturas compartilhadas.
- Softwares que utilizam armazenamento exclusivo.

---

# Quando evitar Recreate?

Na maioria das aplicações web modernas.

APIs REST.

Microsserviços.

Aplicações escaláveis.

Sistemas distribuídos.

Nesses cenários o RollingUpdate normalmente oferece uma experiência muito melhor.

---

# RollingUpdate x Recreate

| Característica | RollingUpdate | Recreate |
|----------------|---------------|----------|
| Mantém a aplicação disponível | ✅ | ❌ |
| Pods antigos e novos convivem | ✅ | ❌ |
| Atualização gradual | ✅ | ❌ |
| Existe downtime | Não | Sim |
| Indicado para produção | Sim | Apenas quando necessário |

---

# Como verificar a estratégia utilizada?

Podemos inspecionar o Deployment.

```bash
kubectl describe deployment \
    nginx-deployment \
    -n giropops
```

Ou:

```bash
kubectl get deployment \
    nginx-deployment \
    -o yaml
```

Na saída encontraremos:

```yaml
strategy:
  type: Recreate
```

Ou.

```yaml
strategy:
  type: RollingUpdate
```

---

# Posso mudar de estratégia depois?

Sim.

O Deployment pode ser alterado a qualquer momento.

Por exemplo.

Antes.

```yaml
strategy:
  type: Recreate
```

Depois.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

Basta aplicar novamente.

```bash
kubectl apply -f deployment.yaml
```

A nova estratégia será utilizada nas próximas atualizações.

---

# Resumo

```text
Deployment

│

├── RollingUpdate
│      │
│      ├── Atualização gradual
│      └── Alta disponibilidade
│
└── Recreate
       │
       ├── Remove todos os Pods
       ├── Cria novos Pods
       └── Existe downtime
```

---

# Conclusão

O **Recreate** é uma estratégia simples e eficiente para aplicações que não permitem duas versões executando simultaneamente.

Entretanto, ela sacrifica a disponibilidade durante a atualização.

Por isso, em aplicações modernas, o **RollingUpdate** costuma ser a estratégia recomendada.

Conhecer ambas é importante para escolher a abordagem correta em cada cenário.

No próximo artigo da série vamos estudar o **histórico de revisões (Revision History)** dos Deployments, entender como o Kubernetes registra cada atualização e aprender a consultar esse histórico antes de realizar um rollback.

---

## Referências

- [Kubernetes Documentation – Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Deployment Strategy](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)
- [Kubernetes Documentation – Updating a Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
