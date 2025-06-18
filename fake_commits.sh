# #!/bin/bash

# # ======== CONFIGURATION ========
# GITHUB_USERNAME="as906871"
# REPO_NAME="Miletone"
# GITHUB_EMAIL="as906871@gmail.com"
# REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
# START_DATE=$(date -d "-5 months" +%Y-%m-%d)
# COMMITS_PER_DAY=3
# BRANCH="main"
# LOG_FILE="commit_log.txt"
# # ================================

# echo "🚀 Starting GitHub fake contributions script"
# echo "Logging to $LOG_FILE"
# echo "Target repo: $REMOTE_URL"

# # Initialize repo if not already
# if [ ! -d ".git" ]; then
#     git init
# fi

# # Configure Git
# git config user.name "$GITHUB_USERNAME"
# git config user.email "$GITHUB_EMAIL"

# # Ensure commit file exists
# touch activity.log

# # Clear previous log
# echo "" > $LOG_FILE

# # Convert start date to timestamp
# start=$(date -d "$START_DATE" +%s)
# end=$(date +%s)

# # Loop through each day from start to today
# while [ "$start" -le "$end" ]; do
#     DATE=$(date -d "@$start" +%Y-%m-%d)
#     for ((i=1; i<=$COMMITS_PER_DAY; i++)); do
#         # UUID=$(uuidgen)
#         UUID=$(date +%s%N)
#         echo "$DATE - Commit $i - $UUID" >> activity.log

#         GIT_AUTHOR_DATE="$DATE 12:00:00" \
#         GIT_COMMITTER_DATE="$DATE 12:00:00" \
#         git add activity.log && \
#         git commit -m "Fake commit on $DATE #$i"

#         echo "$DATE #$i - Committed with UUID $UUID" >> $LOG_FILE
#     done
#     start=$((start + 86400))  # Add 1 day
# done

# # Create remote if not already added
# if ! git remote get-url origin &> /dev/null; then
#     git remote add origin "$REMOTE_URL"
# fi

# # Ensure you're on main branch
# git branch -M $BRANCH

# # Push to GitHub
# git push origin $BRANCH

# echo "✅ Push complete. Check your GitHub contribution graph."
# echo "📘 All commit logs saved in $LOG_FILE"



#!/bin/bash

# ================= CONFIG ===================
GITHUB_USERNAME="as906871"
REPO_NAME="Miletone"
GITHUB_EMAIL="as906871@gmail.com"
COMMITS_PER_DAY=1
MONTHS_BACK=6
BRANCH="main"
COMMIT_FILE="activity.log"
LOG_FILE="commit_log.txt"
REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
# ============================================

echo "🚀 Starting Enhanced GitHub Contribution Script"
echo "🔧 Generating fake commits from $MONTHS_BACK months ago..."

# Use date calc depending on platform
START_DATE=$(date -d "-$MONTHS_BACK months" +%Y-%m-%d 2>/dev/null || date -v -"$MONTHS_BACK"m +%Y-%m-%d)
start=$(date -d "$START_DATE" +%s)
end=$(date +%s)

# Git setup
if [ ! -d ".git" ]; then git init; fi
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"
touch "$COMMIT_FILE"
echo "" > "$LOG_FILE"

# UUID fallback if not available
function gen_uuid() {
  if command -v uuidgen > /dev/null; then
    uuidgen
  else
    echo "$(date +%s)-$RANDOM"
  fi
}

# Commits loop
while [ "$start" -le "$end" ]; do
  DATE=$(date -d "@$start" +%Y-%m-%d)
  for ((i=1; i<=$COMMITS_PER_DAY; i++)); do
    UUID=$(gen_uuid)
    echo "$DATE - Commit $i - $UUID" >> "$COMMIT_FILE"
    GIT_AUTHOR_DATE="$DATE 12:00:00" \
    GIT_COMMITTER_DATE="$DATE 12:00:00" \
    git add "$COMMIT_FILE" && \
    git commit -m "Fake commit on $DATE #$i"
    echo "$DATE #$i - $UUID" >> "$LOG_FILE"
  done
  start=$((start + 86400))  # +1 day
done

# Remote handling
git branch -M "$BRANCH"
if ! git remote get-url origin &> /dev/null; then
  git remote add origin "$REMOTE_URL"
fi

# Smart push
echo "📤 Pushing commits to $REMOTE_URL..."
git pull origin "$BRANCH" --rebase || echo "ℹ️ Pull skipped or failed, pushing anyway..."
git push origin "$BRANCH"

echo "✅ Done. Check your contribution graph after 10–15 minutes."
echo "📘 Commit log saved to $LOG_FILE"
