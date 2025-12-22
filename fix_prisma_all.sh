#!/bin/bash
files=$(find app/api -name "*.js" -exec grep -l "new PrismaClient()" {} \;)
count=0
for file in $files; do
  echo "Fixing: $file"
  content=$(cat "$file")
  echo "$content" | sed "s|import { PrismaClient } from.*|import { prisma } from '@/lib/prisma'|" | sed "/const prisma = new PrismaClient()/d" > "$file"
  ((count++))
done
echo "Fixed $count files"
