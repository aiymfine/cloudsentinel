output "s3_bucket_name" {
  description = "Name of the created S3 bucket"
  value       = aws_s3_bucket.documents.bucket
}

output "dynamodb_users_table" {
  description = "Name of the DynamoDB users table"
  value       = aws_dynamodb_table.users.name
}

output "dynamodb_audit_table" {
  description = "Name of the DynamoDB audit logs table"
  value       = aws_dynamodb_table.audit_logs.name
}

output "iam_access_key_id" {
  description = "IAM access key ID for the application"
  value       = aws_iam_access_key.app_key.id
  sensitive   = true
}

output "iam_secret_access_key" {
  description = "IAM secret access key for the application"
  value       = aws_iam_access_key.app_key.secret
  sensitive   = true
}

output "localstack_endpoint" {
  description = "LocalStack endpoint URL"
  value       = var.localstack_endpoint
}
