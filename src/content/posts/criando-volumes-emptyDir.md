---

title: Configurando volumes emptyDir em Pods no Kubernetes
description: Aprenda a criar e montar um volume temporário emptyDir em um Pod do Kubernetes, definir seu limite de armazenamento e testar seu funcionamento.
date: 2026-07-21
category: Kubernetes
tags: [kubernetes, volumes, emptydir, pods, kubectl, yaml]
series: Fundamentos de Kubernetes
part: 4
totalParts: 4
___

# Configurando volumes emptyDir em Pods no Kubernetes

Containers são, por natureza, efêmeros. Isso significa que arquivos criados dentro do sistema de arquivos de um container podem ser perdidos quando ele é recriado.

Em algumas situações, porém, precisamos armazenar arquivos temporários durante a execução de um Pod ou compartilhar dados entre containers que fazem parte do mesmo Pod.

Para esses casos, o Kubernetes disponibiliza o volume `emptyDir`.

Neste artigo, vamos criar um Pod utilizando uma imagem do Nginx, montar um volume `emptyDir` no diretório `/giropops` e testar seu funcionamento.

## O que é um volume emptyDir?

O `emptyDir` é um volume temporário criado quando o Pod é iniciado.

Como o próprio nome indica, ele começa como um diretório vazio. Os containers do Pod podem montar esse volume e utilizar o espaço para armazenar arquivos temporários.

Uma característica importante é que o volume pertence ao **Pod**, e não diretamente ao container.

Por isso:

* se o container reiniciar, os arquivos continuam disponíveis;
* se o Pod for removido, os arquivos são apagados;
* se outro Pod for criado, ele receberá um novo `emptyDir` vazio.

Esse tipo de volume não deve ser utilizado para armazenar informações que precisam permanecer disponíveis após a exclusão do Pod.

## Criando o manifesto do Pod

Vamos criar o arquivo `pod-emptydir.yaml` com o seguinte conteúdo:

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: coringao
  name: coringao

spec:
  containers:
    - image: nginx
      name: webserver

      volumeMounts:
        - mountPath: /giropops
          name: primeiro-emptydir

      resources:
        limits:
          cpu: "1.5"
          memory: "128Mi"
        requests:
          cpu: "0.5"
          memory: "64Mi"

  dnsPolicy: ClusterFirst
  restartPolicy: Always

  volumes:
    - name: primeiro-emptydir
      emptyDir:
        sizeLimit: "256Mi"
```

Nesse manifesto, criamos um Pod chamado `coringao` contendo um único container chamado `webserver`.

O container utiliza a imagem oficial do Nginx:

```yaml
image: nginx
name: webserver
```

Também definimos solicitações e limites de CPU e memória:

```yaml
resources:
  limits:
    cpu: "1.5"
    memory: "128Mi"
  requests:
    cpu: "0.5"
    memory: "64Mi"
```

O container solicita meio núcleo de CPU e `64 MiB` de memória, podendo utilizar no máximo `1.5` CPU e `128 MiB` de memória.

## Declarando o volume emptyDir

O volume é declarado dentro de `spec.volumes`:

```yaml
volumes:
  - name: primeiro-emptydir
    emptyDir:
      sizeLimit: "256Mi"
```

O campo `name` identifica o volume dentro do Pod:

```yaml
name: primeiro-emptydir
```

Já o campo `emptyDir` informa ao Kubernetes que queremos criar um volume temporário:

```yaml
emptyDir:
```

Também definimos um limite de armazenamento de `256 MiB`:

```yaml
sizeLimit: "256Mi"
```

Por padrão, o `emptyDir` utiliza o armazenamento temporário disponível no nó em que o Pod está executando.

## Montando o volume no container

Declarar um volume não significa que ele será automaticamente disponibilizado dentro do container.

Precisamos montá-lo utilizando `volumeMounts`:

```yaml
volumeMounts:
  - mountPath: /giropops
    name: primeiro-emptydir
```

O campo `mountPath` informa em qual diretório do container o volume será montado:

```yaml
mountPath: /giropops
```

Já o campo `name` precisa ser exatamente igual ao nome informado em `spec.volumes`:

```yaml
name: primeiro-emptydir
```

A associação acontece pelo nome:

```yaml
volumeMounts:
  - name: primeiro-emptydir
```

```yaml
volumes:
  - name: primeiro-emptydir
```

Se os nomes forem diferentes, o Kubernetes não conseguirá identificar qual volume deve ser montado no container.

## Validando o manifesto

Antes de criar o recurso, podemos validar o arquivo localmente utilizando:

```bash
kubectl apply --dry-run=client -f pod-emptydir.yaml
```

Se o manifesto estiver correto, será apresentada uma saída semelhante a:

```text
pod/coringao created (dry run)
```

O `--dry-run=client` valida a estrutura do manifesto sem criar o Pod no cluster.

## Criando o Pod

Depois da validação, aplicamos o manifesto:

```bash
kubectl apply -f pod-emptydir.yaml
```

A saída esperada é:

```text
pod/coringao created
```

Podemos acompanhar o estado do Pod com:

```bash
kubectl get pods
```

Exemplo:

```text
NAME       READY   STATUS    RESTARTS   AGE
coringao   1/1     Running   0          10s
```

Quando o campo `STATUS` estiver como `Running`, o container estará em execução.

## Entrando no container

Para verificar se o volume foi montado corretamente, podemos abrir um terminal dentro do container:

```bash
kubectl exec -ti coringao -- sh
```

Dentro do container, executamos:

```bash
ls
```

O diretório `/giropops` aparecerá entre os diretórios disponíveis:

```text
bin
boot
dev
docker-entrypoint.d
docker-entrypoint.sh
etc
giropops
home
lib
lib64
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
usr
var
```

Isso indica que o volume foi montado no caminho definido no manifesto.

## Criando arquivos no emptyDir

Agora podemos criar arquivos dentro do volume:

```bash
touch /giropops/CORINTHIANS
touch /giropops/VAI
```

Em seguida, listamos o conteúdo:

```bash
ls /giropops
```

A saída será:

```text
CORINTHIANS  VAI
```

Também podemos utilizar um item por linha:

```bash
ls -1 /giropops
```

Saída:

```text
CORINTHIANS
VAI
```

Os arquivos foram gravados no volume `emptyDir`, e não diretamente na camada gravável do container.

## Conferindo a montagem do volume

Outra forma de verificar se o volume está montado é utilizar:

```bash
kubectl exec coringao -- mount
```

Podemos filtrar apenas a montagem relacionada ao diretório `/giropops`:

```bash
kubectl exec coringao -- mount | grep giropops
```

Também podemos verificar o espaço disponível:

```bash
kubectl exec coringao -- df -h /giropops
```

## Alterando um Pod existente

Durante a configuração, pode acontecer de já existir um Pod com o mesmo nome.

Ao tentar adicionar o volume ou modificar campos como nome do container, recursos e montagens, o Kubernetes pode apresentar o seguinte erro:

```text
The Pod "coringao" is invalid: spec: Forbidden:
pod updates may not change fields
```

Isso acontece porque grande parte da especificação de um Pod é imutável depois que ele é criado.

Não podemos, por exemplo, adicionar um novo volume diretamente a um Pod que já está em execução.

Nesse caso, precisamos remover o Pod antigo:

```bash
kubectl delete pod coringao
```

Depois, recriamos o recurso utilizando o manifesto atualizado:

```bash
kubectl apply -f pod-emptydir.yaml
```

Também existe o comando:

```bash
kubectl replace --force -f pod-emptydir.yaml
```

O `--force` remove o recurso existente e cria outro com base no novo manifesto.

Em ambientes reais, normalmente não administramos Pods individuais dessa forma. Geralmente utilizamos recursos como `Deployment`, que são responsáveis por criar e substituir os Pods automaticamente.

## Erros comuns ao configurar volumeMounts

Um erro comum é utilizar `volumeMount` no singular:

```yaml
volumeMount:
```

O campo correto é `volumeMounts`, no plural:

```yaml
volumeMounts:
```

Outro erro possível é escrever incorretamente o campo `sizeLimit`.

Incorreto:

```yaml
sizeLImit: "256Mi"
```

Correto:

```yaml
sizeLimit: "256Mi"
```

Os campos dos manifestos Kubernetes são sensíveis a letras maiúsculas e minúsculas.

Também é importante garantir que o nome informado em `volumeMounts` seja igual ao nome declarado em `volumes`.

Incorreto:

```yaml
volumeMounts:
  - name: primeiro-volume
```

```yaml
volumes:
  - name: primeiro-emptydir
```

Correto:

```yaml
volumeMounts:
  - name: primeiro-emptydir
```

```yaml
volumes:
  - name: primeiro-emptydir
```

## Testando o comportamento do emptyDir

O principal conceito do `emptyDir` é que o volume acompanha o ciclo de vida do Pod.

Se apenas o container reiniciar, os arquivos permanecem no volume.

Porém, se o Pod for excluído:

```bash
kubectl delete pod coringao
```

E criado novamente:

```bash
kubectl apply -f pod-emptydir.yaml
```

O novo volume será criado vazio.

Ao executar:

```bash
kubectl exec coringao -- ls -1 /giropops
```

Os arquivos `CORINTHIANS` e `VAI` não estarão mais disponíveis.

Isso acontece porque o novo Pod possui uma nova instância do volume `emptyDir`.

Podemos resumir seu comportamento da seguinte maneira:

```text
Reinício do container  → os dados permanecem
Exclusão do Pod        → os dados são removidos
Criação de outro Pod   → um novo emptyDir é criado
```

## Quando utilizar emptyDir?

O `emptyDir` pode ser utilizado para:

* armazenar arquivos temporários;
* manter caches durante a execução do Pod;
* compartilhar arquivos entre containers do mesmo Pod;
* guardar resultados intermediários de processamento;
* disponibilizar arquivos produzidos por um container para outro container.

Por exemplo, um container pode gerar arquivos dentro do volume enquanto outro container os processa ou disponibiliza por meio de um servidor web.

Como o volume não sobrevive à exclusão do Pod, ele não é indicado para bancos de dados, uploads importantes ou qualquer informação que precise ser armazenada permanentemente.

Para dados persistentes, devemos utilizar recursos como `PersistentVolume` e `PersistentVolumeClaim`.

## Conclusão

Neste artigo, criamos um Pod utilizando a imagem do Nginx e configuramos um volume temporário do tipo `emptyDir`.

O volume foi declarado em `spec.volumes`:

```yaml
volumes:
  - name: primeiro-emptydir
    emptyDir:
      sizeLimit: "256Mi"
```

Depois, ele foi montado no container por meio de `volumeMounts`:

```yaml
volumeMounts:
  - mountPath: /giropops
    name: primeiro-emptydir
```

Também entramos no container, verificamos o diretório `/giropops` e criamos os arquivos `CORINTHIANS` e `VAI` para testar a gravação de dados.

O ponto mais importante é lembrar que o `emptyDir` acompanha o ciclo de vida do Pod: ele sobrevive ao reinício de um container, mas seus dados são removidos quando o Pod deixa de existir.  

# Referências  

## Documentação oficial  

Kubernetes Documentation. Volumes — emptyDir. Disponível em: https://kubernetes.io/docs/concepts/storage/volumes/#emptydir  

Kubernetes Documentation. Configure a Pod to Use a Volume for Storage. Disponível em: https://kubernetes.io/docs/tasks/configure-pod-container/configure-volume-storage/  

Kubernetes Documentation. Ephemeral Volumes. Disponível em: https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/  

Kubernetes Documentation. Local Ephemeral Storage. Disponível em: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#local-ephemeral-storage  

Kubernetes Documentation. Resource Management for Pods and Containers. Disponível em: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/  

Kubernetes Documentation. kubectl apply. Disponível em: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_apply/  

Kubernetes Documentation. kubectl exec. Disponível em: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_exec/  

Kubernetes Documentation. kubectl delete. Disponível em: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_delete/  

## Material complementar  

LINUXtips. PICK – Programa Intensivo de Containers e Kubernetes. Disponível em: https://linuxtips.io/pick/  

LINUXtips. Descomplicando Kubernetes. Disponível em: https://linuxtips.io/courses/