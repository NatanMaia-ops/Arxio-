# Deploy — AWS App Runner

Container deploy of the `web` app (`apps/web`) to AWS App Runner: the
`apps/web/Dockerfile` image is pushed to ECR and served by an App Runner
service with managed HTTPS and autoscaling.

## Prerequisites

- Docker running locally.
- AWS CLI v2 authenticated with permission for ECR, IAM and App Runner.
- Run from a Bash shell (Git Bash, WSL or Linux).

## Usage

```bash
bash deploy/aws/deploy.sh
```

The script is idempotent: the first run creates the resources, later runs
build a fresh image, push it and trigger a new deployment.

## Configuration

Override any of these via environment variables:

| Variable | Default |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `ECR_REPO` | `arxio-web` |
| `SERVICE_NAME` | `arxio-web` |
| `CONTAINER_PORT` | `3001` (matches the Dockerfile) |
| `CPU` / `MEMORY` | `0.25 vCPU` / `0.5 GB` |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` |

## What it creates

- ECR repository `arxio-web`.
- IAM role `AppRunnerECRAccessRole` (lets App Runner pull from ECR).
- App Runner service `arxio-web` with `AutoDeploymentsEnabled`, so pushing a
  new `:latest` image to ECR redeploys automatically.

## Tear down

```bash
aws apprunner delete-service --region us-east-1 \
  --service-arn "$(aws apprunner list-services --region us-east-1 \
    --query "ServiceSummaryList[?ServiceName=='arxio-web'].ServiceArn | [0]" --output text)"
aws ecr delete-repository --repository-name arxio-web --region us-east-1 --force
```
