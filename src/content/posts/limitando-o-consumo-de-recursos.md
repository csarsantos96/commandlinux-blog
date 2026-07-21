---
title: Limitando o consumo de CPU e memória de Pods no Kubernetes
description: Aprenda a configurar requests e limits em Pods do Kubernetes, entender como o Scheduler utiliza esses valores e por que limites de CPU e memória são importantes.
date: 2026-07-21
category: Kubernetes
tags: [kubernetes, pods, resources, requests, limits, cpu, memory]
series: Fundamentos de Kubernetes
part: 3
totalParts: 4
---

> Este artigo é uma continuação da série **Fundamentos de Kubernetes**. Nos posts anteriores aprendemos o que são Pods, como criá-los utilizando o `kubectl` e como gerar manifestos YAML. Agora veremos como controlar o consumo de recursos dos containers.

> **Nota:** Este conteúdo foi produzido a partir dos meus estudos no **PICK – Programa Intensivo de Containers e Kubernetes**, da LINUXtips, complementado pela documentação oficial do Kubernetes.

# Limitando o consumo de CPU e memória de Pods no Kubernetes

Quando executamos aplicações em um cluster Kubernetes, é importante impedir que um único container consuma todos os recursos disponíveis do Node.

Para isso, o Kubernetes permite definir quanto de CPU e memória um container **solicita** e quanto ele **pode utilizar no máximo**.

Essas configurações são feitas através do bloco `resources`.



# Criando um manifesto

Partindo do manifesto criado no artigo anterior, podemos criar uma nova versão para adicionar os limites de recursos.

```text
cp pod.yaml pod-limitado.yaml
```

Depois basta editar o novo arquivo.



# Estrutura do manifesto

Nosso Pod ficará semelhante ao exemplo abaixo:

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: timao

spec:
  containers:
    - name: ubuntu
      image: ubuntu

      args:
        - sleep
        - "1800"

      resources:
        requests:
          cpu: "300m"
          memory: "64Mi"

        limits:
          cpu: "500m"
          memory: "128Mi"
```

Após salvar o arquivo, podemos aplicá-lo no cluster.

```bash
kubectl apply -f pod-limitado.yaml
```



# O bloco resources

Toda a configuração relacionada ao consumo de recursos fica dentro de:

```yaml
resources:
```

Esse bloco possui duas seções principais:

- `requests`
- `limits`

Embora pareçam semelhantes, elas possuem funções diferentes.



# Requests

Os **requests** representam a quantidade mínima de recursos que o container solicita ao cluster.

```yaml
resources:
  requests:
    cpu: "300m"
    memory: "64Mi"
```

Esses valores são utilizados pelo **Scheduler** durante o agendamento do Pod.

Antes de escolher um Node, o Scheduler verifica se existe capacidade suficiente para atender aos recursos solicitados.

Podemos pensar nos requests como uma **garantia mínima**.

Se informarmos:

```yaml
cpu: "300m"
```

estamos solicitando aproximadamente **300 millicores**, ou cerca de **30% de um núcleo de CPU**.

Já:

```yaml
memory: "64Mi"
```

solicita **64 MiB (Mebibytes)** de memória RAM para o container.



# Limits

Enquanto os requests representam a quantidade mínima garantida, os **limits** definem o consumo máximo permitido.

```yaml
resources:
  limits:
    cpu: "500m"
    memory: "128Mi"
```

Quando o container atinge esses valores, o comportamento depende do recurso.

## Limite de CPU

Ao ultrapassar o limite de CPU, o container **não é encerrado**.

O Kernel reduz o tempo de processamento disponível para ele, processo conhecido como **CPU Throttling**.

Na prática, a aplicação continua funcionando, porém com desempenho reduzido.

## Limite de memória

Com memória o comportamento é diferente.

Se o container ultrapassar o limite definido, o Kernel encerra o processo para proteger o restante do sistema.

No Kubernetes normalmente veremos o status:

```text
OOMKilled
```

Esse é um dos problemas mais comuns encontrados em aplicações que não possuem limites configurados corretamente.



# Verificando o Pod

Após criar o recurso, podemos visualizar suas configurações utilizando:

```bash
kubectl describe pod timao
```

Caso seja necessário acessar o container:

```bash
kubectl exec -it timao -- sh
```

Dentro dele podemos utilizar alguns comandos para inspecionar o ambiente.

Ver processos:

```bash
ps -ef
```

Ver utilização de memória:

```bash
free -m
```

Esses comandos ajudam a compreender o comportamento do container durante os testes.



# Conclusão

Configurar **requests** e **limits** é uma das práticas mais importantes no Kubernetes.

Enquanto os **requests** garantem os recursos mínimos necessários para que o Scheduler consiga posicionar corretamente o Pod em um Node, os **limits** evitam que um container utilize recursos além do permitido.

Essa configuração torna o cluster mais previsível, melhora o compartilhamento de recursos entre aplicações e reduz problemas causados por consumo excessivo de CPU e memória.



# Referências

## Documentação oficial

- Kubernetes Documentation. **Resource Management for Pods and Containers**. Disponível em: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

- Kubernetes Documentation. **Assign CPU Resources to Containers and Pods**. Disponível em: https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/

- Kubernetes Documentation. **Assign Memory Resources to Containers and Pods**. Disponível em: https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/

- Kubernetes Documentation. **kubectl apply**. Disponível em: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/

- Kubernetes Documentation. **kubectl describe**. Disponível em: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_describe/

## Material complementar

- LINUXtips. **PICK – Programa Intensivo de Containers e Kubernetes**. Disponível em: https://linuxtips.io/pick/

- LINUXtips. **Descomplicando Kubernetes**. Disponível em: https://linuxtips.io/courses/