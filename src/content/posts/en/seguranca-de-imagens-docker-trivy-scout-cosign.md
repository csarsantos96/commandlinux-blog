---
title: >-
  Docker Image Security: Trivy, Docker Scout, Distroless, and Signing with
  Cosign
description: >-
  Close the Docker learning loop by learning to scan for vulnerabilities with
  Trivy and Docker Scout, reduce the attack surface with distroless images, and
  sign images with cosign.
date: '2026-06-29'
updatedDate: '2026-07-30'
category: DOCKER
tags:
  - docker
  - security
  - trivy
  - sbom
  - distroless
  - cosign
  - devops
draft: false
language: en
translationOf: seguranca-de-imagens-docker-trivy-scout-cosign
sourceHash: c38aa3e4bf857165000462c24a9330b743a52ee5e2574f3e612c3b9d2d41067c
series: Docker in Practice
part: 9
totalParts: 9
---
# Docker image security: Trivy, Docker Scout, distroless, and signing with cosign

After learning how to build, connect, and orchestrate containers throughout this series, there's still one question left to answer that's easy to forget along the way: **is this image secure?**

## Reducing the attack surface with distroless images

A `distroless` image is an ultra-lean Docker image, designed to run the application with the absolute minimum inside the container — no shell, no package manager, none of the tools of a full operating system.

```dockerfile
FROM gcr.io/distroless/static
COPY meu-app /meu-app
CMD ["/meu-app"]
```

The idea is straightforward: **smaller image + fewer exposed vulnerabilities + more security**. If a malicious binary managed to run inside such a container, it wouldn't even have a shell available to move around from there. The [Chainguard](https://www.chainguard.dev/) project follows this same philosophy, maintaining minimalist base images that are constantly updated against known CVEs.

## Checking for vulnerabilities with Trivy

[Trivy](https://trivy.dev/) scans an image layer by layer, looking for known vulnerabilities (CVEs) in installed packages:

```bash
trivy image nome-da-imagem
```

## Docker Scout

Docker Scout is the image analysis tool integrated into the Docker CLI itself. Besides listing vulnerabilities, it also suggests fixes:

```bash
docker scout cves nome-da-imagem
docker scout recommendations giropops-senhas:1.0
```

- `cves` lists the known vulnerabilities found in the image.
- `recommendations` suggests adjustments — such as swapping the base image for a more recent or leaner version — to reduce identified risks.

Behind these analyses is the concept of **SBOM** (*Software Bill of Materials*): a complete list of all components and packages that make up an image. It's this inventory that tools like Trivy and Docker Scout use as a basis to cross-reference with databases of known vulnerabilities.

## Signing images with cosign

Scanning for vulnerabilities ensures that the image components are secure. But there's another question: how to guarantee that the image running in production is *exactly* the same one you built — and not a tampered version at some point between build and deploy (a compromised registry, for example)?

[cosign](https://docs.sigstore.dev/), part of the Sigstore project, solves this by digitally signing images.

Generating the key pair:

```bash
cosign generate-key-pair
```

This command generates two files: `cosign.key` (the private key, which signs) and `cosign.pub` (the public key, which anyone can use to verify the signature).

Signing the image:

```bash
cosign sign nome-da-imagem
```

With the image signed, a deploy pipeline can be configured to only accept running images whose signature is validated with the corresponding public key — blocking any image that might have been swapped along the way.

## Conclusion

From the first `docker container run` to signing images with cosign, this series covered the complete lifecycle of a containerized application: creating and managing containers, building custom images, ensuring they remain healthy, persisting data, connecting services over a network, orchestrating everything with Compose, and finally, verifying that what's running in production is trustworthy.

## References

- [Trivy Docs](https://trivy.dev/latest/docs/) — installation and usage of the vulnerability scanner.
- [Docker Docs — Docker Scout](https://docs.docker.com/scout/) — vulnerability analysis and SBOM integrated into the Docker CLI.
- [Chainguard — Distroless images](https://www.chainguard.dev/) — minimalist base images continuously maintained against CVEs.
- [Sigstore — cosign](https://docs.sigstore.dev/cosign/signing/signing_with_containers/) — signing and verification of container images.
- [LINUXtips — Descomplicando o Docker](https://linuxtips.io/treinamento/descomplicando-o-docker/) — course used as the basis for my studies and these notes.
