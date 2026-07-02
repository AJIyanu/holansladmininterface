#!/bin/bash

DEST="../architecture-export"

mkdir -p "$DEST"

# Generate tree from project root
(
    cd ..
    tree -I "node_modules|.next|.git|coverage|dist|build|.turbo|.vercel" > "$DEST/frontend-tree.txt"
)

FILES=(
"lib/env.ts"
"lib/server-fetch.ts"
"lib/auth-server.ts"
"lib/auth-tokens.ts"
"lib/authenticated-route-fetch.ts"
"lib/account-route-handler.ts"
"lib/permissions.ts"
"types/auth.ts"

"app/dashboard/layout.tsx"

"components/layout/DashboardLayout.tsx"
"components/layout/layout-registry.tsx"
"components/layout/types.ts"
"components/layout/navigation.ts"
"components/layout/styles/style-1/style-1-layout.tsx"
"components/layout/styles/style-1/style-1-navigation.tsx"

"app/dashboard/admin/staff/page.tsx"

"features/account/staff/list/staff-list.tsx"
"features/account/staff/list/staff-card.tsx"
"features/account/staff/list/staff-list-types.ts"
"features/account/staff/list/staff-pagination.tsx"
"features/account/staff/list/staff-filters.tsx"
"features/account/staff/list/staff-action-dialog.tsx"

"features/account/staff/staff-form.tsx"

"app/api/account/staff/route.ts"
"app/api/account/users/[id]/route.ts"

"app/dashboard/admin/security/audit-logs/page.tsx"
"features/account/security/security-table.tsx"
"features/account/security/types.ts"
)

for file in "${FILES[@]}"; do
    mkdir -p "$DEST/$(dirname "$file")"
    cp "$file" "$DEST/$file"
done

echo "✅ Architecture exported to: $DEST"