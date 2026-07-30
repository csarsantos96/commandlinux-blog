---
title: "Atualizando um Deployment no Kubernetes: como aplicar mudanças com segurança"
description: Aprenda como atualizar um Deployment no Kubernetes, entender o papel do kubectl apply e como o cluster detecta e aplica alterações automaticamente.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, kubectl, yaml, update, rollingupdate, devops]
series: Fundamentos de Deployments no Kubernetes
part: 4
totalParts: 8
---

# Atualizando um Deployment no Kubernetes: como aplicar mudanças com segurança

> Muita gente acredita que atualizar um Deployment significa apagar tudo e criar novamente. Na maioria dos casos, isso está errado.

Uma das maiores vantagens de utilizar um **Deployment** é justamente a facilidade para atualizar aplicações.

Você altera o manifesto.

Aplica novamente.

E o Kubernetes identifica exatamente o que mudou.

Sem precisar remover o Deployment manualmente.

Neste artigo vamos entender como funciona esse processo e quais comandos fazem parte dele.



# Como um Deployment é atualizado?

O Kubernetes trabalha de forma declarativa.

Você não informa **como** atualizar.

Você informa **como deseja que o Deployment fique**.

Depois disso, o Kubernetes compara o estado atual com o manifesto enviado.

Se existir alguma diferença, ele realiza apenas as alterações necessárias.

O fluxo é semelhante ao seguinte:

```text
deployment.yaml
       │
       ▼
kubectl apply
       │
       ▼
Kubernetes compara

Estado atual
      X
Estado desejado
       │
       ▼
Aplica apenas as mudanças
```



# Alterando um Deployment

Imagine que já existe um Deployment criado.

Agora queremos adicionar um Namespace.

Basta alterar o manifesto.

Antes:

```yaml
metadata:
  name: nginx-deployment
```

Depois:

```yaml
metadata:
  name: nginx-deployment
  namespace: giropops
```

Também poderíamos alterar:

- número de réplicas;
- imagem do container;
- recursos;
- labels;
- strategy.

Depois basta aplicar novamente.



# Aplicando as alterações

Após modificar o manifesto:

```bash
kubectl apply -f deployment.yaml
```

Explicando:

- `apply` → cria ou atualiza recursos.
- `-f` → utiliza um arquivo YAML.

Resultado esperado:

```text
deployment.apps/nginx-deployment configured
```

Perceba que agora o Kubernetes informa **configured**.

Isso significa que o Deployment já existia e apenas foi atualizado.



# O erro mais comum com Namespaces

Durante os estudos é muito comum adicionar um Namespace ao manifesto.

```yaml
metadata:
  namespace: giropops
```

Depois executar:

```bash
kubectl apply -f deployment.yaml
```

E receber o erro:

```text
Error from server (NotFound):

namespaces "giropops" not found
```

O motivo é simples.

O Namespace ainda não existe.



# Criando um Namespace

Primeiro criamos o Namespace.

```bash
kubectl create namespace giropops
```

Resultado esperado:

```text
namespace/giropops created
```

Depois podemos verificar.

```bash
kubectl get namespaces
```

Resultado esperado:

```text
NAME
default
kube-system
giropops
```

Agora o Deployment poderá ser criado normalmente.



# Gerando o YAML de um Namespace

Assim como acontece com Deployments, também podemos gerar o manifesto.

```bash
kubectl create namespace giropops \
    --dry-run=client \
    -o yaml
```

Resultado esperado:

```yaml
apiVersion: v1
kind: Namespace

metadata:
  name: giropops
```

Ou salvar diretamente em um arquivo.

```bash
kubectl create namespace giropops \
    --dry-run=client \
    -o yaml > namespace.yaml
```

Depois:

```bash
kubectl apply -f namespace.yaml
```

Essa abordagem facilita o versionamento no Git.



# Consultando recursos dentro do Namespace

Depois que o Deployment passa a existir dentro do Namespace, precisamos informar isso nos comandos.

Por exemplo.

Em vez de:

```bash
kubectl get deployments
```

Utilizamos:

```bash
kubectl get deployments -n giropops
```

Ou:

```bash
kubectl get deploy -n giropops
```

Explicando:

- `-n` → abreviação de `--namespace`.
- `giropops` → Namespace consultado.

Resultado esperado:

```text
NAME               READY
nginx-deployment   3/3
```



# Atualizando a imagem da aplicação

Uma das alterações mais comuns é trocar a imagem.

Antes:

```yaml
containers:
  - name: nginx
    image: nginx:1.30.4
```

Depois:

```yaml
containers:
  - name: nginx
    image: nginx:1.31.0
```

Após salvar o arquivo:

```bash
kubectl apply -f deployment.yaml
```

O Kubernetes detectará automaticamente essa alteração.

Nos próximos artigos veremos exatamente como essa atualização acontece internamente.



# Como o Kubernetes identifica mudanças?

Toda vez que executamos:

```bash
kubectl apply
```

O Kubernetes compara o manifesto recebido com o Deployment já existente.

Podemos imaginar esse processo da seguinte maneira.

```text
Manifesto antigo
        │
        ▼
Manifesto novo
        │
        ▼
Comparação
        │
        ▼
Aplicar apenas diferenças
```

Isso evita recriações desnecessárias.

Também reduz indisponibilidade.



# Resumo

O fluxo completo de atualização fica assim.

```text
Editar deployment.yaml
         │
         ▼
kubectl apply -f deployment.yaml
         │
         ▼
Kubernetes compara
         │
         ▼
Atualiza somente o necessário
```

É justamente essa característica que torna o Deployment um recurso tão poderoso.



# Conclusão

Atualizar um Deployment normalmente significa apenas alterar o manifesto e reaplicá-lo.

O Kubernetes identifica automaticamente as diferenças e realiza as modificações necessárias.

Também vimos como trabalhar com Namespaces e como consultar recursos dentro deles.

No próximo artigo da série vamos estudar a estratégia padrão utilizada pelo Deployment para atualizar aplicações: o **RollingUpdate**, entendendo como funcionam os parâmetros **maxSurge** e **maxUnavailable** e por que eles permitem atualizar aplicações praticamente sem indisponibilidade.



## Referências

- [Kubernetes Documentation – Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Kubernetes Documentation – Declarative Object Management](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
