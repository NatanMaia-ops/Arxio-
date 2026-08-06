#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="${ACCOUNT_ID:-839922332678}"
SERVICE_NAME="${SERVICE_NAME:-arxio}"
ECR_REPO="${ECR_REPO:-arxio}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
VPC_CONNECTOR="${VPC_CONNECTOR:-arxio-connector}"
ACCESS_ROLE="${ACCESS_ROLE:-AppRunnerECRAccessRole}"
INSTANCE_ROLE="${INSTANCE_ROLE:-ArxioAppRunnerInstanceRole}"
CPU="${CPU:-0.5 vCPU}"
MEMORY="${MEMORY:-1 GB}"
AUTH_GOOGLE_ID="${AUTH_GOOGLE_ID:-659214370882-3vgklr3r2fhdj6kt54kog2ukmd9ps00u.apps.googleusercontent.com}"
PUBLIC_URL="${PUBLIC_URL:-https://placeholder.arxio.invalid}"

secret_arn() {
	aws secretsmanager describe-secret --region "$AWS_REGION" --secret-id "$1" --query ARN --output text
}

CONNECTOR_ARN="$(aws apprunner list-vpc-connectors --region "$AWS_REGION" \
	--query "VpcConnectors[?VpcConnectorName=='${VPC_CONNECTOR}']|[0].VpcConnectorArn" --output text)"

SOURCE_CONFIG=$(
	cat <<EOF
{
  "ImageRepository": {
    "ImageIdentifier": "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest",
    "ImageRepositoryType": "ECR",
    "ImageConfiguration": {
      "Port": "${CONTAINER_PORT}",
      "RuntimeEnvironmentVariables": {
        "NODE_ENV": "production",
        "AUTH_GOOGLE_ID": "${AUTH_GOOGLE_ID}",
        "CORS_ORIGIN": "${PUBLIC_URL}",
        "AUTH_URL": "${PUBLIC_URL}"
      },
      "RuntimeEnvironmentSecrets": {
        "DATABASE_URL": "$(secret_arn arxio/database-url)",
        "AUTH_SECRET": "$(secret_arn arxio/auth-secret)",
        "JWT_SECRET": "$(secret_arn arxio/jwt-secret)",
        "AUTH_GOOGLE_SECRET": "$(secret_arn arxio/google-client-secret)"
      }
    }
  },
  "AutoDeploymentsEnabled": true,
  "AuthenticationConfiguration": {
    "AccessRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/${ACCESS_ROLE}"
  }
}
EOF
)

NETWORK_CONFIG="{ \"EgressConfiguration\": { \"EgressType\": \"VPC\", \"VpcConnectorArn\": \"${CONNECTOR_ARN}\" } }"
INSTANCE_CONFIG="{ \"Cpu\": \"${CPU}\", \"Memory\": \"${MEMORY}\", \"InstanceRoleArn\": \"arn:aws:iam::${ACCOUNT_ID}:role/${INSTANCE_ROLE}\" }"
HEALTH_CONFIG='{"Protocol":"HTTP","Path":"/health","Interval":10,"Timeout":5,"HealthyThreshold":1,"UnhealthyThreshold":5}'

SERVICE_ARN="$(aws apprunner list-services --region "$AWS_REGION" \
	--query "ServiceSummaryList[?ServiceName=='${SERVICE_NAME}'].ServiceArn | [0]" --output text)"

if [ "$SERVICE_ARN" = "None" ] || [ -z "$SERVICE_ARN" ]; then
	aws apprunner create-service --region "$AWS_REGION" --service-name "$SERVICE_NAME" \
		--source-configuration "$SOURCE_CONFIG" \
		--network-configuration "$NETWORK_CONFIG" \
		--instance-configuration "$INSTANCE_CONFIG" \
		--health-check-configuration "$HEALTH_CONFIG" \
		--query 'Service.[Status,ServiceUrl]' --output text
else
	aws apprunner update-service --region "$AWS_REGION" --service-arn "$SERVICE_ARN" \
		--source-configuration "$SOURCE_CONFIG" \
		--network-configuration "$NETWORK_CONFIG" \
		--instance-configuration "$INSTANCE_CONFIG" \
		--health-check-configuration "$HEALTH_CONFIG" \
		--query 'Service.[Status,ServiceUrl]' --output text
fi
