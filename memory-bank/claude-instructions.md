# Critical Instructions for Claude

## ⚠️ DO NOT RUN LONG-RUNNING PROCESSES

**VERY IMPORTANT**: Never start development servers or long-running processes for the user.

### Why:
- Claude cannot effectively terminate processes
- This creates ghost processes that consume ports
- User must manually kill processes (e.g., `lsof -ti:3000 | xargs kill -9`)

### What NOT to do:
- ❌ `npm run dev`
- ❌ `npm start`
- ❌ `vercel dev`
- ❌ `node server.js`
- ❌ Any command that starts a server or daemon
- ❌ Using `run_in_background` for servers

### What to do instead:
1. **Provide instructions** for the user to run the command themselves
2. **Only run** if user explicitly asks you to start a server
3. **Warn** the user that they'll need to manually kill the process when done

### Example response:
```
To test locally, run:
  npm start

This will start the dev server at http://localhost:3000

When you're done, press Ctrl+C to stop the server.
```

---

## Project-Specific Notes

### Local Development
- User should run: `npm start` or `vercel dev` manually
- Runs on ports: 3000 (main), 3001 (backup)
- To kill ports: `lsof -ti:3000 | xargs kill -9`

### Architecture
- Vercel serverless functions (no Express server)
- API functions use `.js` import extensions
- Single Vercel deployment for production
