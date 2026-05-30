#!/bin/bash

# ==============================================================================
# SecurePro AWS Infrastructure Provisioning Script
# ==============================================================================
REGION="us-east-1"
RANDOM_SUFFIX=$(LC_ALL=C tr -dc 'a-z0-9' < /dev/urandom | head -c 6)
BUCKET_NAME="securepro-assets-$RANDOM_SUFFIX"

echo "🚀 Starting SecurePro AWS Resource Provisioning..."
echo "Region: $REGION"

# ------------------------------------------------------------------------------
# 1. Create S3 Bucket
# ------------------------------------------------------------------------------
echo -e "\n📦 Creating S3 Bucket: $BUCKET_NAME"
if [ "$REGION" == "us-east-1" ]; then
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION"
else
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION"
fi

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to create S3 bucket. Please check your Access Keys."
    exit 1
fi

echo "🔒 Configuring CORS for S3 Bucket..."
cat <<EOF > cors-config.json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": []
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --cors-configuration file://cors-config.json

rm cors-config.json

# ------------------------------------------------------------------------------
# 2. Create DynamoDB Tables
# ------------------------------------------------------------------------------
echo -e "\n🗄️ Creating DynamoDB Tables..."

create_simple_table() {
    TABLE_NAME=$1
    PARTITION_KEY=$2
    
    echo "Creating table: $TABLE_NAME (Partition Key: $PARTITION_KEY)..."
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions AttributeName=$PARTITION_KEY,AttributeType=S \
        --key-schema AttributeName=$PARTITION_KEY,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION"
        
    if [ $? -eq 0 ]; then
        echo "✅ Table '$TABLE_NAME' creation initiated."
    else
        echo "❌ ERROR creating table $TABLE_NAME."
    fi
}

create_simple_table "securepro-students" "studentId"
create_simple_table "securepro-exams" "examId"
create_simple_table "securepro-assignments" "studentId"
create_simple_table "securepro-groups" "groupId"

echo "Creating table: securepro-results (Partition Key: studentId, Sort Key: attemptId)..."
aws dynamodb create-table \
    --table-name "securepro-results" \
    --attribute-definitions \
        AttributeName=studentId,AttributeType=S \
        AttributeName=attemptId,AttributeType=S \
    --key-schema \
        AttributeName=studentId,KeyType=HASH \
        AttributeName=attemptId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ Table 'securepro-results' creation initiated."
fi

# ------------------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------------------
echo -e "\n🎉 Provisioning Script finished running!"
echo "====================================================================="
echo "If there were NO ERRORS above, your next steps are:"
echo "1. Verify resources in your AWS Console."
echo "2. Provide the S3 bucket name to your AI Assistant: $BUCKET_NAME"
echo "====================================================================="
