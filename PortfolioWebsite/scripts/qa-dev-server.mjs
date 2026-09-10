import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process";
const content=path.resolve(".qa/dev-content"), accounts=path.resolve(".qa/dev-accounts");
fs.mkdirSync(content,{recursive:true});fs.mkdirSync(accounts,{recursive:true});
fs.writeFileSync(path.join(content,"profile.json"),JSON.stringify({name:"",biography:"",headshotImage:"",education:[],tools:[],jobs:[]}));
fs.writeFileSync(path.join(content,"projects.json"),"[]");fs.mkdirSync(path.join(content,"portfolios"),{recursive:true});fs.writeFileSync(path.join(content,"portfolios","index.json"),"[]");fs.writeFileSync(path.join(accounts,"accounts.json"),"[]");
const child=spawn(process.execPath,[path.resolve("node_modules/next/dist/bin/next"),"dev","--hostname","127.0.0.1","--port","3101"],{env:{...process.env, FIREBASE_PROJECT_ID: "", FIREBASE_WEB_API_KEY: "", PORTFOLIO_DISABLE_LOCAL_EDITOR: "0", PORTFOLIO_UPLOAD_DIR: path.resolve(".qa/uploads"),PORTFOLIO_CONTENT_DIR:content,PORTFOLIO_ACCOUNT_DIR:accounts,PORTFOLIO_BUILD_DIR:".next-qa-dev",SESSION_SECRET:"qa-dev-session-secret",NEXT_TELEMETRY_DISABLED:"1",VERCEL:"0"},stdio:"inherit",windowsHide:true});
process.on("SIGINT",()=>child.kill());process.on("SIGTERM",()=>child.kill());child.on("exit",code=>process.exit(code||0));
