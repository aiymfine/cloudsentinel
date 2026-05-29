#!/bin/bash
# ─── CloudSentinel Teardown Script ───

echo "🛡️  CloudSentinel - Teardown"
echo "=============================="

# Stop Docker Compose services
echo "Stopping Docker Compose services..."
docker compose down -v

# Optionally destroy Terraform resources
read -p "Destroy Terraform resources? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd terraform
    terraform destroy -auto-approve
    cd ..
fi

echo "✅ Teardown complete"
