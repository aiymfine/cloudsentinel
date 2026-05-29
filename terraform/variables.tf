variable "s3_bucket_name" {
  description = "Name of the S3 bucket for document storage"
  type        = string
  default     = "cloud-sentinel-docs"
}

variable "dynamodb_users_table" {
  description = "Name of the DynamoDB table for user data"
  type        = string
  default     = "cloud-sentinel-users"
}

variable "dynamodb_audit_table" {
  description = "Name of the DynamoDB table for audit logs"
  type        = string
  default     = "cloud-sentinel-audit"
}

variable "localstack_endpoint" {
  description = "LocalStack endpoint URL"
  type        = string
  default     = "http://localhost:4566"
}
