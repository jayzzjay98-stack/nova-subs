#!/bin/bash
# Script to remove .env from git history
# WARNING: This will rewrite git history!

echo "⚠️  This will rewrite Git history and remove .env file"
echo "Make sure you have backed up your work!"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Removing .env from git history..."
    
    # Remove .env from all commits
    git filter-branch --force --index-filter \
      "git rm --cached --ignore-unmatch .env" \
      --prune-empty --tag-name-filter cat -- --all
    
    # Force push to remote (dangerous!)
    echo ""
    echo "⚠️  WARNING: About to force push to remote"
    echo "This will rewrite history on GitHub!"
    read -p "Force push to origin? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        git push origin --force --all
        echo "✅ Done! .env removed from git history"
        echo "⚠️  Remember to rotate your Supabase keys!"
    else
        echo "Skipped force push. Run manually: git push origin --force --all"
    fi
else
    echo "Cancelled"
fi
