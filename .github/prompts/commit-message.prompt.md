## Commit Message Prompt

For this prompt, you must use a git diff to evaluate the set of changed files and their contents. Based on this evaluation, you will generate a commit message that accurately describes the changes made in the codebase. If you already have context for the commit message from a chat log, that should be used with priority.

### Requirements
- Commit message should start with fix, feature, or chore depending on the nature of the change.
- If you don't know commit message to be used, ask the user before continuing.
- Commit message should be concise and to the point, ideally under 72 characters.

### Operation
- When completed with the commit message, you may proceed with the git commit including any git add operations for unstaged changes.
