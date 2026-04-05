# News Claw — Setup

## Git Hook Setup

This project uses a pre-push hook to enforce documentation updates alongside code changes.

After cloning, run:
```bash
git config core.hooksPath .githooks
```

This tells git to look for hooks in `.githooks/` instead of `.git/hooks/`.

To test the hook is working:
```bash
# Should succeed (doc updated with code):
git commit --allow-empty -m "test" && git push

# Should fail (code without docs):
echo "// test" >> static/index.html && git commit -am "wip" && git push
# → should be rejected
```
