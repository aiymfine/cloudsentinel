# ─── S3 Bucket for Document Storage ───

resource "aws_s3_bucket" "documents" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "CloudSentinel Documents"
    Environment = "local"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "cleanup-incomplete-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# ─── DynamoDB Table: Users ───

resource "aws_dynamodb_table" "users" {
  name         = var.dynamodb_users_table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "username"
    type = "S"
  }

  global_secondary_index {
    name            = "UsernameIndex"
    hash_key        = "username"
    projection_type = "ALL"
  }

  tags = {
    Name        = "CloudSentinel Users"
    Environment = "local"
    ManagedBy   = "terraform"
  }
}

# ─── DynamoDB Table: Audit Logs ───

resource "aws_dynamodb_table" "audit_logs" {
  name         = var.dynamodb_audit_table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "timestamp"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "action"
    type = "S"
  }

  global_secondary_index {
    name            = "ActionIndex"
    hash_key        = "action"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = {
    Name        = "CloudSentinel Audit Logs"
    Environment = "local"
    ManagedBy   = "terraform"
  }
}

# ─── IAM Policy (for reference / K8s secrets) ───

resource "aws_iam_user" "app_user" {
  name = "cloud-sentinel-app"
  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_iam_access_key" "app_key" {
  user = aws_iam_user.app_user.name
}

resource "aws_iam_user_policy" "app_policy" {
  name = "cloud-sentinel-app-policy"
  user = aws_iam_user.app_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.documents.arn,
          "${aws_s3_bucket.documents.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.audit_logs.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.audit_logs.arn}/index/*"
        ]
      }
    ]
  })
}
