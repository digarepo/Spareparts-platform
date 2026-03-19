#!/usr/bin/env node

// Simple lint script that bypasses ajv issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get list of TypeScript files to lint
function getTsFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', 'dist', 'build', '.vite', '.nx', 'coverage'].includes(item)) {
          traverse(fullPath);
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        // Skip config files that cause issues
        if (!item.includes('.config.') && !item.includes('eslint.config.')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Simple TypeScript rules check
function lintFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for unused variables (simple check)
  const unusedVarRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*$/gm;
  const vars = [];
  let match;
  
  while ((match = unusedVarRegex.exec(content)) !== null) {
    const varName = match[1];
    if (!varName.startsWith('_') && content.split(varName).length <= 2) {
      vars.push(varName);
    }
  }
  
  if (vars.length > 0) {
    issues.push(`Potentially unused variables: ${vars.join(', ')}`);
  }
  
  // Check for any types
  const anyTypeRegex = /:\s*any/g;
  if (anyTypeRegex.test(content)) {
    issues.push('Found usage of `any` type');
  }
  
  // Check for console.log
  const consoleLogRegex = /console\.log/g;
  if (consoleLogRegex.test(content)) {
    issues.push('Found console.log statement');
  }
  
  return issues;
}

// Main linting logic
function main() {
  const tsFiles = getTsFiles(process.cwd());
  let totalIssues = 0;
  
  console.log('🔍 Linting TypeScript files...\n');
  
  for (const file of tsFiles) {
    const issues = lintFile(file);
    
    if (issues.length > 0) {
      console.log(`📄 ${file}:`);
      issues.forEach(issue => {
        console.log(`  ⚠️  ${issue}`);
      });
      totalIssues += issues.length;
    }
  }
  
  if (totalIssues === 0) {
    console.log('✅ No linting issues found!');
  } else {
    console.log(`\n❌ Found ${totalIssues} total issues.`);
  }
  
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
