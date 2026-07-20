---
title: Criando e administrando Pods com kubectl e manifestos YAML
description: Aprenda a gerar manifestos YAML, criar Pods e utilizar os principais comandos do kubectl para administrar recursos no Kubernetes.
date: 2026-07-20
category: Kubernetes
tags: [kubernetes, kubectl, pods, yaml, manifests, devops] 
series: Fundamentos de Kubernetes
part: 2
totalParts: 4

---
> Este artigo é uma continuação do post **Conhecendo os Pods e o kubectl**. Se você ainda não leu a primeira parte, recomendo começar por ela para entender os conceitos fundamentais antes de avançar para os manifestos YAML.  

# Conhecendo manifestos YAML e administrando Pods com kubectl

No artigo anterior conhecemos os Pods e aprendemos como criar nosso primeiro recurso utilizando o comando `kubectl run`.

Embora esse comando seja extremamente útil para estudos e testes rápidos, ele não representa a forma mais comum de trabalhar com Kubernetes em ambientes de produção.

Na prática, a maioria das aplicações é criada através de **manifestos YAML** que ficam versionados em um repositório Git.

Neste artigo vamos aprender como gerar esses manifestos automaticamente utilizando o `kubectl`, entender sua estrutura e conhecer alguns dos comandos mais utilizados para administrar Pods.



# Gerando um manifesto YAML

Imagine que desejamos criar um Pod utilizando a imagem do Nginx.

Poderíamos executar diretamente:

```bash
kubectl run corinthians --image=nginx
```

Entretanto, existe uma forma muito melhor de fazer isso.

```bash
kubectl run corinthians \
  --image=nginx \
  --port=80 \
  --dry-run=client \
  -o yaml > pod.yaml
```

Esse comando não cria nenhum recurso.

Ele apenas gera o manifesto YAML e salva seu conteúdo dentro do arquivo `pod.yaml`.

Vamos entender cada opção.



# O parâmetro `--image`

```bash
--image=nginx
```

Define qual imagem será utilizada pelo container.

Quando o Pod for criado, o Kubernetes tentará localizar essa imagem em um registro de containers.

Caso ela não exista localmente, será baixada automaticamente.



# O parâmetro `--port`

```bash
--port=80
```

Informa que o container utiliza a porta 80.

Isso faz com que o manifesto contenha:

```yaml
ports:
  - containerPort: 80
```

É importante lembrar que essa opção **não publica** a aplicação.

Para isso ainda será necessário criar um Service.



# O parâmetro `--dry-run=client`

Essa é uma das opções mais úteis durante os estudos.

```bash
--dry-run=client
```

O termo **dry-run** significa executar uma simulação.

Em vez de enviar uma requisição para o Kubernetes, o `kubectl` monta o recurso localmente.

Na prática acontece o seguinte:

```text
kubectl
      │
      ▼
Monta o objeto
      │
      ▼
Gera o YAML
      │
      ▼
Não cria nenhum recurso
```

Como toda a simulação acontece dentro do próprio `kubectl`, utilizamos a opção `client`.



# O parâmetro `-o yaml`

A opção `-o` significa **output**.

```bash
-o yaml
```

Ela informa ao `kubectl` que desejamos visualizar o recurso no formato YAML.

O resultado será semelhante ao seguinte:

```yaml
apiVersion: v1
kind: Pod

metadata:
  labels:
    run: corinthians
  name: corinthians

spec:
  containers:
  - image: nginx
    name: corinthians
    ports:
    - containerPort: 80

  dnsPolicy: ClusterFirst
  restartPolicy: Always
```



# O operador `>`

A parte final do comando costuma gerar dúvidas.

```bash
> pod.yaml
```

Isso não pertence ao Kubernetes.

Esse operador faz parte do shell Linux.

Ele redireciona a saída do comando para um arquivo.

Sem ele, o YAML seria exibido diretamente no terminal.

Com ele, todo o conteúdo será salvo em `pod.yaml`.



# Conhecendo a estrutura do manifesto

Agora que o arquivo foi criado, podemos entender sua estrutura.

## apiVersion

Define qual versão da API será utilizada.

```yaml
apiVersion: v1
```



## kind

Informa qual recurso será criado.

```yaml
kind: Pod
```



## metadata

Armazena informações de identificação do recurso.

```yaml
metadata:
  name: corinthians
  labels:
    run: corinthians
```



## spec

É a parte mais importante do manifesto.

Ela descreve o estado desejado do recurso.

Dentro dela encontramos:

- containers;
- portas;
- políticas de reinicialização;
- DNS;
- volumes;
- recursos.



## containers

Lista todos os containers pertencentes ao Pod.

```yaml
containers:
- image: nginx
  name: corinthians
```

Caso existam Sidecars, eles também aparecerão nessa lista.



## restartPolicy

```yaml
restartPolicy: Always
```

Define o comportamento do Kubernetes caso o container seja encerrado.

Por padrão, Pods criados dessa forma utilizam `Always`.



## dnsPolicy

```yaml
dnsPolicy: ClusterFirst
```

Essa política informa que o Pod utilizará o serviço de DNS do próprio cluster.



# Criando o Pod

Depois de revisar o manifesto basta aplicá-lo.

```bash
kubectl apply -f pod.yaml
```

Resultado esperado:

```text
pod/corinthians created
```

Agora o Kubernetes enviará esse manifesto para o API Server e iniciará o processo de criação do Pod.



# Consultando os Pods

O primeiro comando que normalmente executamos é:

```bash
kubectl get pods
```

Também podemos obter informações adicionais.

```bash
kubectl get pods -o wide
```

Essa opção mostra informações como:

- endereço IP;
- nó onde o Pod está sendo executado.



# Obtendo detalhes

Caso seja necessário investigar um recurso específico:

```bash
kubectl describe pod corinthians
```

Esse comando exibe:

- eventos;
- condições;
- containers;
- imagem;
- volumes;
- IP;
- Node;
- status.

É um dos comandos mais utilizados durante processos de troubleshooting.



# Visualizando logs

Para visualizar os logs de um container utilizamos:

```bash
kubectl logs corinthians
```

Caso desejemos acompanhar os logs em tempo real:

```bash
kubectl logs -f corinthians
```

Se o Pod possuir múltiplos containers, será necessário informar qual deles desejamos consultar.

```bash
kubectl logs corinthians -c busybox
```



# Executando comandos dentro do container

Em muitos momentos será necessário acessar um container para realizar testes ou investigações.

Para isso utilizamos o `kubectl exec`.

```bash
kubectl exec -it corinthians -- sh
```

Esse comando cria um novo processo dentro do container.

Depois disso podemos executar comandos normalmente.

```bash
ls

env

hostname

cat /etc/os-release
```

Na prática, `kubectl exec` é muito mais utilizado do que `kubectl attach`.



# Conhecendo o kubectl attach

O comando `attach` possui um comportamento diferente.

Enquanto o `exec` cria um novo processo, o `attach` conecta nosso terminal ao processo principal do container.

```bash
kubectl attach -it corinthians
```

Na maioria das situações utilizamos o `exec`.

O `attach` costuma ser utilizado apenas em aplicações interativas que já estão aguardando entrada pelo terminal.



# Removendo o Pod

Para remover o recurso:

```bash
kubectl delete pod corinthians
```

Após alguns segundos ele deixará de existir no cluster.



# Resumindo

Durante este artigo aprendemos um fluxo muito utilizado no dia a dia.

```text
kubectl run
        │
        ▼
--dry-run=client
        │
        ▼
-o yaml
        │
        ▼
pod.yaml
        │
        ▼
kubectl apply
        │
        ▼
kubectl get
        │
        ▼
kubectl describe
        │
        ▼
kubectl logs
        │
        ▼
kubectl exec
        │
        ▼
kubectl delete
```

Esse fluxo representa a base do trabalho com Kubernetes e será utilizado em praticamente todos os próximos recursos que estudaremos, como Deployments, Services, ConfigMaps e Ingress.

Nos próximos artigos vamos evoluir para recursos declarativos mais complexos e entender como aplicações reais são executadas dentro de um cluster Kubernetes.
