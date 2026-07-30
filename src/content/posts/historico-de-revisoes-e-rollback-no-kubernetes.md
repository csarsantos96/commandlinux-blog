---
title: "Histórico de Revisões e Rollback no Kubernetes: restaurando versões anteriores de um Deployment"
description: Aprenda como o Kubernetes registra cada atualização de um Deployment, consulte o histórico de revisões e realize rollbacks com segurança.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, rollout, rollback, revisionhistorylimit, devops]
series: Fundamentos de Deployments no Kubernetes
part: 7
totalParts: 8
---

# Histórico de Revisões e Rollback no Kubernetes: restaurando versões anteriores de um Deployment

> E se a nova versão da aplicação apresentar um problema logo após o deploy? Será preciso editar o manifesto manualmente para voltar atrás?

Felizmente, não.

Uma das funcionalidades mais úteis dos **Deployments** é manter um histórico das alterações realizadas. Esse histórico permite acompanhar cada atualização e, quando necessário, retornar rapidamente para uma versão anterior utilizando o **rollback**.

Neste artigo vamos entender como o Kubernetes registra essas revisões, consultar o histórico de um Deployment e aprender a restaurar versões anteriores.

---

# O que é uma revisão?

Sempre que uma alteração no Deployment gera uma nova versão dos Pods, o Kubernetes cria uma **nova revisão** (*revision*).

Cada revisão representa um estado específico daquele Deployment.

Imagine a seguinte sequência de atualizações.

```text
Revision 1

nginx:1.30.4

        │

Atualização

        ▼

Revision 2

nginx:1.31.0

        │

Atualização

        ▼

Revision 3

nginx:1.31.1
```

Cada alteração importante gera uma nova revisão que poderá ser consultada futuramente.

---

# O que gera uma nova revisão?

Nem toda alteração cria uma nova revisão.

Normalmente, alterações no template dos Pods geram uma nova versão.

Por exemplo:

- alteração da imagem;
- alteração de variáveis de ambiente;
- alteração de recursos (CPU e memória);
- inclusão ou remoção de containers;
- mudanças em volumes;
- alterações nas Labels do template.

Essas modificações fazem com que um novo ReplicaSet seja criado.

---

# Consultando o histórico

Para visualizar as revisões existentes utilizamos:

```bash
kubectl rollout history deployment \
    nginx-deployment \
    -n giropops
```

Explicando:

- `rollout history` → exibe o histórico de revisões.
- `deployment` → tipo do recurso.
- `nginx-deployment` → nome do Deployment.
- `-n giropops` → Namespace.

Resultado esperado:

```text
deployment.apps/nginx-deployment

REVISION  CHANGE-CAUSE

1         <none>

2         <none>

3         <none>
```

Cada número representa uma revisão armazenada pelo Deployment.

---

# Consultando uma revisão específica

Também é possível visualizar uma revisão individual.

```bash
kubectl rollout history deployment \
    nginx-deployment \
    --revision=2 \
    -n giropops
```

Resultado esperado:

```text
Pod Template

Image:
nginx:1.31.0

...
```

Esse comando ajuda bastante quando precisamos descobrir exatamente qual versão estava sendo utilizada.

---

# Acompanhando uma atualização

Antes de realizar um rollback, normalmente verificamos se o rollout terminou corretamente.

```bash
kubectl rollout status deployment \
    nginx-deployment \
    -n giropops
```

Resultado esperado:

```text
deployment "nginx-deployment" successfully rolled out
```

Caso exista algum problema durante a atualização, esse comando também indicará que o rollout ainda está em andamento.

---

# Realizando um rollback

Imagine que atualizamos a aplicação.

Antes:

```text
Revision 2

nginx:1.30.4
```

Depois:

```text
Revision 3

nginx:1.31.0
```

Logo após o deploy percebemos um problema.

Podemos retornar para a revisão anterior utilizando:

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    -n giropops
```

Resultado esperado:

```text
deployment.apps/nginx-deployment rolled back
```

O Kubernetes restaurará automaticamente a revisão anterior.

---

# Restaurando uma revisão específica

Também podemos voltar diretamente para uma revisão determinada.

Por exemplo.

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    --revision=2 \
    -n giropops
```

Explicando:

- `undo` → desfaz uma atualização.
- `--revision=2` → retorna exatamente para a revisão 2.

Resultado esperado:

```text
deployment.apps/nginx-deployment rolled back
```

É importante entender um detalhe.

O Kubernetes **não "volta no tempo"**.

Ele utiliza a configuração armazenada naquela revisão para criar um **novo rollout**.

Ou seja, o rollback também gera uma nova revisão no histórico.

Exemplo:

```text
Revision 1

↓

Revision 2

↓

Revision 3

↓

Rollback para Revision 2

↓

Revision 4
```

A Revision 4 possui a mesma configuração da Revision 2, mas é considerada uma nova revisão.

Esse comportamento facilita auditorias e rastreamento das alterações.

---

# Como o rollback funciona internamente?

O fluxo pode ser representado assim.

```text
Deployment

        │

Revision 1

        │

Revision 2

        │

Revision 3

        │

Rollback

        ▼

Novo ReplicaSet

        ▼

Revision 4
```

Perceba que o Kubernetes nunca reutiliza diretamente um ReplicaSet antigo.

Ele cria um novo rollout baseado na configuração daquela revisão.

---

# Limitando a quantidade de revisões

O Deployment pode armazenar diversas revisões.

Entretanto, manter um histórico muito grande consome recursos desnecessários.

Para controlar isso existe o campo `revisionHistoryLimit`.

```yaml
spec:
  revisionHistoryLimit: 5
```

Nesse exemplo o Kubernetes manterá apenas as cinco revisões mais recentes.

As mais antigas serão removidas automaticamente.

---

# Quando utilizar revisionHistoryLimit?

Esse parâmetro é bastante útil em ambientes de produção.

Alguns exemplos.

| Cenário | Valor sugerido |
|---------|----------------|
| Laboratórios | 2 a 3 |
| Aplicações pequenas | 5 |
| Produção | 10 |
| Ambientes altamente críticos | Conforme política da empresa |

Não existe um valor universal.

A escolha depende da frequência de deploys e da necessidade de auditoria.

---

# Resumo dos comandos

| Comando | Função |
|---------|--------|
| `kubectl rollout status` | Acompanha a atualização |
| `kubectl rollout history` | Lista as revisões |
| `kubectl rollout history --revision` | Mostra uma revisão específica |
| `kubectl rollout undo` | Retorna para a revisão anterior |
| `kubectl rollout undo --revision` | Retorna para uma revisão específica |

---

# Resumo

```text
Deployment

│

├── Revision 1

├── Revision 2

├── Revision 3

│

└── Rollback

        │

        ▼

Nova revisão criada
```

Cada atualização importante gera uma nova revisão.

Quando necessário, podemos retornar rapidamente para versões anteriores utilizando apenas um comando.

---

# Conclusão

O histórico de revisões é um dos recursos mais valiosos dos Deployments.

Ele oferece rastreabilidade, facilita auditorias e permite recuperar rapidamente uma versão estável da aplicação em caso de problemas.

Também vimos que o rollback não reaproveita diretamente uma revisão antiga: ele cria um novo rollout baseado naquela configuração, preservando todo o histórico do Deployment.

No próximo e último artigo da série vamos reunir todos os conceitos estudados e explorar boas práticas para trabalhar com Deployments em ambientes de produção, incluindo organização de manifestos, uso de Namespaces, estratégias de atualização e recomendações para o dia a dia.

---

## Referências

- [Kubernetes Documentation – Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation – Rollback to a Previous Revision](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-to-a-previous-revision)
- [Kubernetes Documentation – kubectl rollout](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout)
- [LINUXtips – Descomplicando Kubernetes](https://linuxtips.io/)
