---
title: "Boas práticas para Deployments no Kubernetes: organizando aplicações para produção"
description: Reúna todos os conceitos aprendidos sobre Deployments e conheça boas práticas para criar aplicações mais organizadas, seguras e fáceis de manter.
date: 2026-07-30
category: Kubernetes
tags: [kubernetes, deployment, production, best-practices, devops, yaml, rollout]
series: Fundamentos de Deployments no Kubernetes
part: 8
totalParts: 8
---

# Boas práticas para Deployments no Kubernetes: organizando aplicações para produção

> Saber criar um Deployment é importante. Mas saber mantê-lo organizado e preparado para produção é o que realmente diferencia um ambiente profissional de um laboratório.

Ao longo desta série conhecemos praticamente todos os recursos fundamentais dos Deployments.

Aprendemos a criar aplicações, entender a estrutura do manifesto, realizar atualizações, configurar estratégias de rollout e executar rollbacks.

Neste último artigo vamos reunir tudo isso e apresentar algumas boas práticas que fazem parte do dia a dia de equipes DevOps e SRE.

---

# Recapitulando o ciclo de vida de um Deployment

Antes de falar sobre boas práticas, vale lembrar como funciona o fluxo completo.

```text
Criar Deployment
        │
        ▼
Deployment cria ReplicaSet
        │
        ▼
ReplicaSet cria Pods
        │
        ▼
Aplicação entra em execução
        │
        ▼
Atualização
        │
        ▼
Novo ReplicaSet
        │
        ▼
RollingUpdate
        │
        ▼
Nova revisão
        │
        ▼
Rollback (se necessário)
```

Todo esse processo acontece automaticamente graças ao Deployment.

---

# Sempre utilize manifestos versionados

Um dos erros mais comuns de quem está começando é criar recursos apenas utilizando comandos do `kubectl`.

Embora isso seja útil para estudos, ambientes reais normalmente utilizam arquivos YAML armazenados em um repositório Git.

Por exemplo:

```text
kubernetes/

├── namespace.yaml

├── deployment.yaml

├── service.yaml

├── ingress.yaml

└── configmap.yaml
```

Dessa forma fica muito mais fácil revisar alterações, restaurar versões anteriores e trabalhar em equipe.

---

# Utilize Namespaces para organizar recursos

Evite concentrar todas as aplicações no Namespace `default`.

Em vez disso, crie ambientes separados.

```text
default

dev

staging

production

monitoring
```

Essa organização facilita permissões, monitoramento e administração do cluster.

---

# Dê nomes consistentes aos recursos

Evite nomes genéricos.

Por exemplo.

Em vez de:

```text
deployment1
```

Prefira:

```text
api-pedidos

frontend-web

nginx-ingress

payments-api
```

Quanto mais descritivo for o nome, mais fácil será administrar o ambiente.

---

# Padronize Labels

As Labels são utilizadas por diversos componentes do Kubernetes.

Uma boa padronização facilita filtros e integrações.

Exemplo.

```yaml
metadata:
  labels:
    app: api-pedidos
    environment: production
    team: plataforma
```

Depois podemos consultar recursos facilmente.

```bash
kubectl get pods \
    -l environment=production
```

Ou.

```bash
kubectl get deployments \
    -l team=plataforma
```

---

# Sempre defina Requests e Limits

Um Deployment sem limites de recursos pode causar diversos problemas.

O recomendado é definir ambos.

```yaml
resources:

  requests:
    cpu: "300m"
    memory: "128Mi"

  limits:
    cpu: "800m"
    memory: "512Mi"
```

Isso ajuda o Scheduler a distribuir melhor as cargas e evita que um único container consuma recursos excessivos do nó.

---

# Utilize RollingUpdate sempre que possível

Na maioria das aplicações modernas, o RollingUpdate é a melhor escolha.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

Essa configuração mantém a aplicação disponível durante praticamente toda a atualização.

A estratégia Recreate deve ser reservada apenas para aplicações que realmente não suportam duas versões executando simultaneamente.

---

# Configure revisionHistoryLimit

Guardar centenas de revisões normalmente não faz sentido.

Uma configuração simples costuma ser suficiente.

```yaml
spec:
  revisionHistoryLimit: 5
```

Assim o histórico permanece útil sem ocupar recursos desnecessários.

---

# Monitore os rollouts

Após cada atualização é uma boa prática verificar se tudo ocorreu corretamente.

```bash
kubectl rollout status deployment \
    nginx-deployment \
    -n giropops
```

Resultado esperado.

```text
deployment "nginx-deployment" successfully rolled out
```

Caso exista algum problema, você descobrirá imediatamente.

---

# Utilize describe para troubleshooting

Sempre que algum Deployment apresentar comportamento inesperado, o primeiro comando normalmente é:

```bash
kubectl describe deployment \
    nginx-deployment \
    -n giropops
```

Ele mostra informações importantes como:

- estratégia utilizada;
- eventos;
- ReplicaSets;
- Pods;
- condições do Deployment;
- erros durante a criação.

---

# Acompanhe os Pods

Outro hábito importante é verificar continuamente os Pods durante uma atualização.

```bash
kubectl get pods \
    -n giropops
```

Ou acompanhar em tempo real.

```bash
kubectl get pods \
    -w \
    -n giropops
```

O parâmetro `-w` (*watch*) mantém a saída sendo atualizada automaticamente conforme os Pods mudam de estado.

---

# Faça rollbacks quando necessário

Nem toda atualização será perfeita.

Quando surgir algum problema.

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    -n giropops
```

Ou para retornar a uma revisão específica.

```bash
kubectl rollout undo deployment \
    nginx-deployment \
    --revision=4 \
    -n giropops
```

Em ambientes de produção, voltar rapidamente para uma versão estável costuma ser muito mais importante do que tentar corrigir a aplicação imediatamente.

---

# Checklist antes de aplicar um Deployment

Antes de executar um `kubectl apply`, vale conferir alguns itens.

| Item | Verificado? |
|-------|-------------|
| Namespace correto | ✅ |
| Labels padronizadas | ✅ |
| Selector compatível com o template | ✅ |
| Requests e Limits definidos | ✅ |
| Estratégia de atualização escolhida | ✅ |
| revisionHistoryLimit configurado | ✅ |
| Imagem correta | ✅ |

Esse pequeno checklist ajuda a evitar boa parte dos erros mais comuns.

---

# Fluxo recomendado

Uma rotina bastante utilizada em ambientes profissionais pode ser representada assim.

```text
Editar deployment.yaml
        │
        ▼
Revisar alterações
        │
        ▼
Git Commit
        │
        ▼
kubectl apply
        │
        ▼
rollout status
        │
        ▼
Aplicação funcionando
        │
        ▼
Rollback (se necessário)
```

Perceba que praticamente todo o trabalho acontece sobre os arquivos YAML.

O cluster apenas recebe o estado desejado.

---

# O que estudar depois?

Agora que você domina os Deployments, alguns dos próximos assuntos naturais dentro do Kubernetes são:

- Services
- Ingress
- ConfigMaps
- Secrets
- Volumes Persistentes
- StatefulSets
- DaemonSets
- Jobs e CronJobs
- Horizontal Pod Autoscaler (HPA)
- Kustomize
- Helm

Todos esses recursos trabalham em conjunto com os Deployments e fazem parte do dia a dia de quem administra clusters Kubernetes.

---

# Resumo da série

Durante esta série aprendemos:

| Parte | Conteúdo |
|--------|----------|
| 1 | O que é um Deployment |
| 2 | Selector, Template e ReplicaSet |
| 3 | Criando Deployments com YAML e kubectl |
| 4 | Atualizando Deployments |
| 5 | RollingUpdate, maxSurge e maxUnavailable |
| 6 | Estratégia Recreate |
| 7 | Revision History e Rollback |
| 8 | Boas práticas para produção |

Esses conhecimentos formam uma base sólida para trabalhar com Deployments em ambientes reais.

---

# Conclusão

Os **Deployments** estão entre os recursos mais importantes do Kubernetes.

Eles simplificam o gerenciamento das aplicações, automatizam atualizações, mantêm o estado desejado do cluster e oferecem mecanismos seguros para recuperação em caso de falhas.

Mais do que decorar comandos, compreender o funcionamento interno dos Deployments permite tomar decisões melhores durante o desenvolvimento e a operação de aplicações em produção.

A partir dessa base, você estará preparado para avançar para outros recursos fundamentais do ecossistema Kubernetes, construindo aplicações cada vez mais resilientes, escaláveis e fáceis de administrar.

---

## Referências

- [Kubernetes Documentation — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Documentation — Managing Resources](https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/)
- [Kubernetes Documentation — Workloads](https://kubernetes.io/docs/concepts/workloads/)
- [Kubernetes Documentation — Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [LINUXtips — Descomplicando Kubernetes](https://linuxtips.io/)
