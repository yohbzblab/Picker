#!/bin/bash
files=$(find app/api -name "*.js" -exec grep -l "new PrismaClient()" {} \; | head -20)
for file in $files; do
  echo "Fixing: $file"
  # Read the file content
  content=$(cat "$file")
  # Replace import statement
  echo "$content" | sed "s|import { PrismaClient } from.*|import { prisma } from '@/lib/prisma'|" | sed "/const prisma = new PrismaClient()/d" > "$file"
done
