---
title: "Criando Deployments no Kubernetes: manifestos YAML e kubectl create"
description: Aprenda as principais formas de criar um Deployment no Kubernetes, utilizando manifestos YAML e o comando kubectl create.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, kubectl, yaml, manifests, devops]
series: Fundamentos de Deployments no Kubernetes
part: 3
totalParts: 8
---

# Criando Deployments no Kubernetes: manifestos YAML e kubectl create

> Você realmente precisa escrever um manifesto YAML inteiro para criar um Deployment?

A resposta é: depende.

O Kubernetes oferece diferentes maneiras de criar um Deployment.

Algumas são excelentes para estudos rápidos.

Outras são ideais para ambientes de produção.

Neste artigo vamos conhecer essas abordagens e entender quando utilizar cada uma delas.



# Criando um Deployment através de um manifesto

A maneira mais utilizada em projetos reais é utilizando arquivos YAML.

É nesse arquivo que declaramos como queremos que a aplicação funcione.

Um exemplo simples:

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

Depois basta aplicar o manifesto.

```bash
kubectl apply -f deployment.yaml
```

Resultado esperado:

```text
deployment.apps/nginx-deployment created
```



# Criando um Deployment usando apenas um comando

Também é possível criar um Deployment diretamente pela linha de comando.

```bash
kubectl create deployment nginx-deployment \
    --image=nginx:1.30.4
```

Explicando os parâmetros:

- `create` → cria um novo recurso.
- `deployment` → tipo do recurso.
- `nginx-deployment` → nome do Deployment.
- `--image` → imagem utilizada pelos Pods.

Resultado esperado:

```text
deployment.apps/nginx-deployment created
```

Esse método é bastante útil para testes rápidos.

Entretanto, ele possui uma limitação importante.

Toda a configuração fica apenas no cluster.

Você não possui um manifesto versionado.



# Definindo a quantidade de réplicas

Também podemos informar a quantidade inicial de Pods.

```bash
kubectl create deployment nginx-deployment \
    --image=nginx:1.30.4 \
    --replicas=3
```

Resultado esperado:

```text
deployment.apps/nginx-deployment created
```

Agora o Deployment criará três Pods automaticamente.



# Gerando um manifesto automaticamente

Existe um recurso extremamente útil do kubectl.

Podemos pedir para ele gerar o YAML sem criar nada no cluster.

```bash
kubectl create deployment nginx-deployment \
    --image=nginx:1.30.4 \
    --replicas=3 \
    --dry-run=client \
    -o yaml
```

Explicando os novos parâmetros:

- `--dry-run=client` → simula a criação localmente.
- `-o yaml` → imprime o resultado em formato YAML.

Resultado esperado:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
...
```

Esse comando é excelente para iniciar um manifesto rapidamente.



# Salvando diretamente em um arquivo

Também podemos redirecionar essa saída.

```bash
kubectl create deployment nginx-deployment \
    --image=nginx:1.30.4 \
    --replicas=3 \
    --dry-run=client \
    -o yaml > deployment.yaml
```

Agora temos um arquivo YAML pronto para editar.

Essa prática é muito comum durante o desenvolvimento.



# Aplicando o manifesto editado

Depois de ajustar o arquivo, basta aplicá-lo.

```bash
kubectl apply -f deployment.yaml
```

A partir desse momento o manifesto passa a ser a fonte de verdade da aplicação.



# Visualizando um Deployment existente

Outra funcionalidade muito útil é exportar um Deployment já existente.

```bash
kubectl get deployment nginx-deployment \
    -o yaml
```

Resultado esperado:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
...
spec:
...
status:
...
```

Essa saída permite estudar como o Kubernetes armazenou aquele recurso.

Também pode servir como base para novos manifestos.



# Exportando para um arquivo

Se desejar salvar o Deployment atual:

```bash
kubectl get deployment nginx-deployment \
    -o yaml > temp.yaml
```

Depois basta remover os campos gerados automaticamente pelo Kubernetes antes de reutilizar esse arquivo.



# Listando os Deployments

Para visualizar todos os Deployments:

```bash
kubectl get deployments
```

Ou:

```bash
kubectl get deploy
```

As duas formas são equivalentes.

Resultado esperado:

```text
NAME               READY   UP-TO-DATE   AVAILABLE
nginx-deployment   3/3     3            3
```



# Descrevendo um Deployment

Quando precisamos investigar um recurso com mais detalhes utilizamos:

```bash
kubectl describe deployment nginx-deployment
```

Esse comando mostra:

- Eventos.
- Estratégia utilizada.
- Réplicas.
- Selector.
- Template.
- ReplicaSet associado.
- Histórico de eventos.

É uma das ferramentas mais utilizadas para troubleshooting.



# Removendo um Deployment

Caso seja necessário excluir o Deployment:

```bash
kubectl delete deployment nginx-deployment
```

Resultado esperado:

```text
deployment.apps "nginx-deployment" deleted
```

Ao remover o Deployment, o ReplicaSet e os Pods controlados por ele também são removidos.



# Qual abordagem devo utilizar?

| Método | Quando utilizar |
|---------|-----------------|
| `kubectl create deployment` | Estudos, testes rápidos e laboratórios |
| Manifesto YAML | Produção, GitOps e versionamento |
| `kubectl apply` | Atualizações contínuas |
| `kubectl get -o yaml` | Estudo e exportação de recursos |

Na prática, ambientes profissionais quase sempre utilizam manifestos armazenados em repositórios Git.



# Resumo

As principais formas de criar um Deployment são:

```text
Manifesto YAML
        │
        ▼
kubectl apply
```

ou

```text
kubectl create deployment
        │
        ▼
--dry-run=client
        │
        ▼
Gerar manifesto YAML
```

A segunda abordagem é uma excelente forma de acelerar a criação de manifestos durante os estudos.



# Conclusão

Agora você conhece as principais maneiras de criar um Deployment.

Também vimos como gerar manifestos automaticamente, exportar recursos existentes e utilizar o `kubectl` para facilitar o trabalho do dia a dia.

No próximo artigo vamos aprender como atualizar um Deployment existente, entender o processo de aplicação das mudanças e descobrir como o Kubernetes realiza atualizações sem interromper completamente a aplicação.



## Referências

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation — kubectl create deployment](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#create)
- [Kubernetes Documentation — Declarative Object Management](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/)
- [LINUXtips — Descomplicando Kubernetes](https://linuxtips.io/)
