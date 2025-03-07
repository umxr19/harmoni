import ts from 'typescript';
import path from 'path';
import fs from 'fs';

function getAllTypeScriptFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('node_modules') && !entry.name.startsWith('.')) {
        getAllTypeScriptFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkTypeScriptErrors() {
  // Get TypeScript configuration
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) {
    throw new Error('Could not find tsconfig.json');
  }

  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));

  // Create program
  const rootDir = path.dirname(configPath);
  const files = getAllTypeScriptFiles(rootDir);
  const program = ts.createProgram(files, options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  // Group errors by file
  const errorsByFile = new Map<string, ts.Diagnostic[]>();
  
  for (const diagnostic of diagnostics) {
    if (diagnostic.file) {
      const filePath = diagnostic.file.fileName;
      const relativePath = path.relative(process.cwd(), filePath);
      if (!errorsByFile.has(relativePath)) {
        errorsByFile.set(relativePath, []);
      }
      errorsByFile.get(relativePath)!.push(diagnostic);
    }
  }

  // Print errors grouped by file
  console.log('\n🔍 TypeScript Error Report\n');
  
  if (errorsByFile.size === 0) {
    console.log('✅ No TypeScript errors found!\n');
    return;
  }

  for (const [file, errors] of errorsByFile) {
    console.log(`\n📁 ${file}`);
    console.log('─'.repeat(file.length + 4));
    
    for (const error of errors) {
      if (error.file) {
        const { line, character } = error.file.getLineAndCharacterOfPosition(error.start!);
        const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
        console.log(`  Line ${line + 1}, Col ${character + 1}: ${message}`);
      }
    }
  }

  console.log(`\n❌ Found ${diagnostics.length} TypeScript errors in total.\n`);
  process.exit(1);
}

checkTypeScriptErrors(); 