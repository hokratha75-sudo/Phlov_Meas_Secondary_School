import fs from 'fs';
import path from 'path';

const SRC_DIR = './artifacts/admin/src';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Replace import
  if (content.includes('import { apiFetch } from "@/lib/api"')) {
    content = content.replace('import { apiFetch } from "@/lib/api";', 'import api from "@/lib/axiosConfig";');
    changed = true;
  } else if (content.includes('import { apiFetch } from "../lib/api"')) {
    content = content.replace('import { apiFetch } from "../lib/api";', 'import api from "../lib/axiosConfig";');
    changed = true;
  }

  // Find all apiFetch calls
  const apiFetchRegex = /apiFetch\(([^,]+),\s*token(?:,\s*(\{[^}]+\}))?\)/g;
  content = content.replace(apiFetchRegex, (match, url, optionsStr) => {
    changed = true;
    if (!optionsStr) {
      // GET request
      return `api.get(${url}).then(res => res.data)`;
    } else {
      // It has options
      if (optionsStr.includes('method: "POST"')) {
        const bodyMatch = optionsStr.match(/body:\s*(JSON\.stringify\([^)]+\)|[^}]+)/);
        let body = '{}';
        if (bodyMatch) {
          body = bodyMatch[1];
          if (body.startsWith('JSON.stringify(')) {
            body = body.slice(15, -1);
          }
        }
        return `api.post(${url}, ${body}).then(res => res.data)`;
      } else if (optionsStr.includes('method: "PUT"')) {
        const bodyMatch = optionsStr.match(/body:\s*(JSON\.stringify\([^)]+\)|[^}]+)/);
        let body = '{}';
        if (bodyMatch) {
          body = bodyMatch[1];
          if (body.startsWith('JSON.stringify(')) {
            body = body.slice(15, -1);
          }
        }
        return `api.put(${url}, ${body}).then(res => res.data)`;
      } else if (optionsStr.includes('method: "DELETE"')) {
        return `api.delete(${url}).then(res => res.data)`;
      } else {
        return `api.get(${url}).then(res => res.data)`;
      }
    }
  });

  if (changed) {
    console.log('Updated:', filePath);
    fs.writeFileSync(filePath, content);
  }
}

processDirectory(SRC_DIR);
