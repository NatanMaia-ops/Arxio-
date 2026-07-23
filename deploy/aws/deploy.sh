#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO="${ECR_REPO:-arxio-web}"
SERVICE_NAME="${SERVICE_NAME:-arxio-web}"
CONTAINER_PORT="${CONTAINER_PORT:-3001}"
CPU="${CPU:-0.25 vCPU}"
MEMORY="${MEMORY:-0.5 GB}"
ACCESS_ROLE_NAME="${ACCESS_ROLE_NAME:-AppRunnerECRAccessRole}"
NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL:-http://localhost:3000}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || echo latest)}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${REGISTRY}/${ECR_REPO}"

echo "==> Deploying to account ${ACCOUNT_ID} / region ${AWS_REGION}"

echo "==> Ensuring ECR repository ${ECR_REPO}"
aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$AWS_REGION" >/dev/null 2>&1 ||
	aws ecr create-repository --repository-name "$ECR_REPO" \
		--image-scanning-configuration scanOnPush=true --region "$AWS_REGION" >/dev/null

echo "==> Building image ${IMAGE_URI}:${IMAGE_TAG}"
docker build -f apps/web/Dockerfile \
	--build-arg "NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}" \
	-t "${IMAGE_URI}:${IMAGE_TAG}" -t "${IMAGE_URI}:latest" .

echo "==> Pushing to ECR"
aws ecr get-login-password --region "$AWS_REGION" |
	docker login --username AWS --password-stdin "$REGISTRY"
docker push "${IMAGE_URI}:${IMAGE_TAG}"
docker push "${IMAGE_URI}:latest"

echo "==> Ensuring App Runner ECR access role ${ACCESS_ROLE_NAME}"
if ! aws iam get-role --role-name "$ACCESS_ROLE_NAME" >/dev/null 2>&1; then
	aws iam create-role --role-name "$ACCESS_ROLE_NAME" \
		--assume-role-policy-document file://deploy/aws/apprunner-ecr-trust-policy.json >/dev/null
	aws iam attach-role-policy --role-name "$ACCESS_ROLE_NAME" \
		--policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
fi
ACCESS_ROLE_ARN="$(aws iam get-role --role-name "$ACCESS_ROLE_NAME" --query Role.Arn --output text)"

SERVICE_ARN="$(aws apprunner list-services --region "$AWS_REGION" \
	--query "ServiceSummaryList[?ServiceName=='${SERVICE_NAME}'].ServiceArn | [0]" --output text)"

if [ "$SERVICE_ARN" = "None" ] || [ -z "$SERVICE_ARN" ]; then
	echo "==> Creating App Runner service ${SERVICE_NAME}"
	aws apprunner create-service --region "$AWS_REGION" \
		--service-name "$SERVICE_NAME" \
		--source-configuration "{
			\"ImageRepository\": {
				\"ImageIdentifier\": \"${IMAGE_URI}:latest\",
				\"ImageRepositoryType\": \"ECR\",
				\"ImageConfiguration\": {
					\"Port\": \"${CONTAINER_PORT}\",
					\"RuntimeEnvironmentVariables\": { \"NEXT_PUBLIC_SERVER_URL\": \"${NEXT_PUBLIC_SERVER_URL}\" }
				}
			},
			\"AutoDeploymentsEnabled\": true,
			\"AuthenticationConfiguration\": { \"AccessRoleArn\": \"${ACCESS_ROLE_ARN}\" }
		}" \
		--instance-configuration "{ \"Cpu\": \"${CPU}\", \"Memory\": \"${MEMORY}\" }" \
		--health-check-configuration "{ \"Protocol\": \"HTTP\", \"Path\": \"/\", \"Interval\": 10, \"Timeout\": 5, \"HealthyThreshold\": 1, \"UnhealthyThreshold\": 5 }" >/dev/null
else
	echo "==> Service exists; starting a new deployment"
	aws apprunner start-deployment --region "$AWS_REGION" --service-arn "$SERVICE_ARN" >/dev/null
fi

echo "==> Done. Service URL:"
aws apprunner list-services --region "$AWS_REGION" \
	--query "ServiceSummaryList[?ServiceName=='${SERVICE_NAME}'].ServiceUrl | [0]" --output text
