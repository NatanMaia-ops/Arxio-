#!/usr/bin/env bash
set -euo pipefail

ACCOUNT_ID="${ACCOUNT_ID:-839922332678}"
BUCKET_NAME="${BUCKET_NAME:-arxio-media-${ACCOUNT_ID}}"
INSTANCE_ROLE="${INSTANCE_ROLE:-ArxioAppRunnerInstanceRole}"
POLICY_NAME="${POLICY_NAME:-arxio-media-s3-policy}"

POLICY_DOCUMENT=$(
	cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}/pending/*",
        "arn:aws:s3:::${BUCKET_NAME}/avatars/*",
        "arn:aws:s3:::${BUCKET_NAME}/article-covers/*"
      ]
    }
  ]
}
EOF
)

POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

if aws iam get-policy --policy-arn "$POLICY_ARN" >/dev/null 2>&1; then
	CURRENT_VERSION="$(aws iam get-policy --policy-arn "$POLICY_ARN" --query 'Policy.DefaultVersionId' --output text)"
	aws iam create-policy-version --policy-arn "$POLICY_ARN" --policy-document "$POLICY_DOCUMENT" --set-as-default >/dev/null
	aws iam delete-policy-version --policy-arn "$POLICY_ARN" --version-id "$CURRENT_VERSION"
else
	aws iam create-policy --policy-name "$POLICY_NAME" --policy-document "$POLICY_DOCUMENT" >/dev/null
fi

aws iam attach-role-policy --role-name "$INSTANCE_ROLE" --policy-arn "$POLICY_ARN"

echo "Policy anexada: ${POLICY_ARN} -> role ${INSTANCE_ROLE}"
