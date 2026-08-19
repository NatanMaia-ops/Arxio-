#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="${ACCOUNT_ID:-839922332678}"
BUCKET_NAME="${BUCKET_NAME:-arxio-media-${ACCOUNT_ID}}"
PUBLIC_URL="${PUBLIC_URL:-https://placeholder.arxio.invalid}"
DEV_ORIGIN="${DEV_ORIGIN:-http://localhost:3001}"

if aws s3api head-bucket --region "$AWS_REGION" --bucket "$BUCKET_NAME" 2>/dev/null; then
	echo "Bucket ${BUCKET_NAME} ja existe, atualizando configuracao"
elif [ "$AWS_REGION" = "us-east-1" ]; then
	aws s3api create-bucket --region "$AWS_REGION" --bucket "$BUCKET_NAME"
else
	aws s3api create-bucket --region "$AWS_REGION" --bucket "$BUCKET_NAME" \
		--create-bucket-configuration "LocationConstraint=${AWS_REGION}"
fi

aws s3api put-public-access-block --region "$AWS_REGION" --bucket "$BUCKET_NAME" \
	--public-access-block-configuration \
	'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false'

BUCKET_POLICY=$(
	cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadUploadedMedia",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}/avatars/*",
        "arn:aws:s3:::${BUCKET_NAME}/article-covers/*"
      ]
    }
  ]
}
EOF
)

aws s3api put-bucket-policy --region "$AWS_REGION" --bucket "$BUCKET_NAME" --policy "$BUCKET_POLICY"

CORS_CONFIG=$(
	cat <<EOF
{
  "CORSRules": [
    {
      "AllowedMethods": ["POST"],
      "AllowedOrigins": ["${PUBLIC_URL}", "${DEV_ORIGIN}"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF
)

aws s3api put-bucket-cors --region "$AWS_REGION" --bucket "$BUCKET_NAME" --cors-configuration "$CORS_CONFIG"

LIFECYCLE_CONFIG=$(
	cat <<'EOF'
{
  "Rules": [
    {
      "ID": "expire-pending-uploads",
      "Filter": { "Prefix": "pending/" },
      "Status": "Enabled",
      "Expiration": { "Days": 1 }
    }
  ]
}
EOF
)

aws s3api put-bucket-lifecycle-configuration --region "$AWS_REGION" --bucket "$BUCKET_NAME" \
	--lifecycle-configuration "$LIFECYCLE_CONFIG"

echo "MEDIA_BUCKET=${BUCKET_NAME}"
echo "MEDIA_REGION=${AWS_REGION}"
echo "MEDIA_PUBLIC_BASE_URL=https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com"
