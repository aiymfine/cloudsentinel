# For local development, we use local state
# For production, configure a remote backend:
#
# terraform {
#   backend "s3" {
#     bucket         = "terraform-state"
#     key            = "cloud-sentinel/terraform.tfstate"
#     region         = "us-east-1"
#     endpoint       = "http://localhost:4566"
#     access_key     = "test"
#     secret_key     = "test"
#     skip_credentials_validation = true
#     skip_metadata_api_check     = true
#     force_path_style            = true
#   }
# }
