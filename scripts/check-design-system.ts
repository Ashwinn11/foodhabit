/**
 * Design System Compliance Checker
 * Run with: npx ts-node scripts/check-design-system.ts
 *
 * This script enforces:
 * 1. No hardcoded colors (hex codes)
 * 2. No hardcoded typography (fontSize, fontFamily, fontWeight)
 * 3. No hardcoded spacing (padding, margin, gap)
 * 4. Use of reusable components (Text, Container, Card, Button, Input)
 * 5. Proper use of theme system
 */

import * as fs from 'fs';
import * as path from 'path';

interface Violation {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

const violations: Violation[] = [];

// Approved brand colors (6 colors only)
const APPROVED_COLORS = new Set([
  '#ff7664', // primary
  '#9bcbab', // secondary
  '#cda4e8', // tertiary
  '#dedfe2', // background
  '#000000', // black
  '#ffffff', // white
]);

// Patterns that indicate design system violations
const violationPatterns = [
  {
    pattern: /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g,
    message: 'Hardcoded hex color found. Only these 6 brand colors are allowed: #ff7664 (primary), #9bcbab (secondary), #cda4e8 (tertiary), #dedfe2 (background), #000000 (black), #ffffff (white). Use theme.colors.brand instead.',
    code: 'DSV001',
    severity: 'error' as const,
  },
  {
    pattern: /backgroundColor:\s*['"]#/g,
    message: 'Hardcoded backgroundColor. Use theme.colors.background or theme.colors.brand instead.',
    code: 'DSV002',
    severity: 'error' as const,
  },
  {
    pattern: /color:\s*['"]#/g,
    message: 'Hardcoded text color. Use theme.colors.text instead.',
    code: 'DSV003',
    severity: 'error' as const,
  },
  {
    pattern: /fontSize:\s*\d+(?!00)/g,
    message:
      'Hardcoded fontSize. Use theme.typography or r.adaptiveFontSize instead. See DESIGN_SYSTEM.md',
    code: 'DSV004',
    severity: 'error' as const,
  },
  {
    pattern: /fontFamily:\s*['"][^'"]+['"]/g,
    message: 'Hardcoded fontFamily. Use theme.typography instead.',
    code: 'DSV005',
    severity: 'error' as const,
  },
  {
    pattern: /fontWeight:\s*['"](?:bold|normal|600|700)['"]/g,
    message: 'Hardcoded fontWeight. Use theme.typography variants instead.',
    code: 'DSV006',
    severity: 'error' as const,
  },
  {
    pattern: /padding:\s*[1-9]\d*(?![a-z])/g,
    message:
      'Hardcoded padding. Use theme.spacing instead. See DESIGN_SYSTEM.md',
    code: 'DSV007',
    severity: 'error' as const,
  },
  {
    pattern: /margin:\s*\d+(?![a-z])/g,
    message:
      'Hardcoded margin. Use theme.spacing instead. See DESIGN_SYSTEM.md',
    code: 'DSV008',
    severity: 'error' as const,
  },
  {
    pattern: /gap:\s*\d+(?![a-z])/g,
    message: 'Hardcoded gap. Use theme.spacing instead.',
    code: 'DSV009',
    severity: 'error' as const,
  },
  {
    pattern: /borderRadius:\s*\d+(?![a-z])/g,
    message:
      'Hardcoded borderRadius. Use theme.borderRadius instead. See DESIGN_SYSTEM.md',
    code: 'DSV010',
    severity: 'error' as const,
  },
  {
    pattern: /<Text\s[^>]*style/g,
    message:
      'Using inline styles with Text component. Ensure you are using theme colors and typography.',
    code: 'DSV011',
    severity: 'warning' as const,
  },
];

// Reusable component patterns
const componentPatterns = [
  {
    pattern: /<View[^>]*style={[^}]*(?:padding|backgroundColor|borderRadius)[^}]*}/g,
    message:
      'Use <Container> component instead of <View> with padding/backgroundColor. See CLAUDE.md',
    code: 'CMP001',
    severity: 'warning' as const,
  },
  {
    pattern: /<TextInput[^>]*style/g,
    message:
      'Use <Input> component instead of <TextInput> for consistency. See CLAUDE.md',
    code: 'CMP002',
    severity: 'warning' as const,
  },
  {
    pattern: /<TouchableOpacity[^>]*(?:style={[^}]*backgroundColor)[^}]*}/g,
    message:
      'Use <Button> component instead of <TouchableOpacity> for buttons. See CLAUDE.md',
    code: 'CMP003',
    severity: 'warning' as const,
  },
  {
    pattern: /\.\.\.[^}]*typography\.[h1-6]/g,
    message:
      'Style override detected: Never override typography with ...theme.typography when using Text variant prop. The variant prop handles typography automatically.',
    code: 'DSV012',
    severity: 'error' as const,
  },
];

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function checkFile(filePath: string): void {
  // Skip node_modules, build output, type definition files, and theme definitions
  if (
    filePath.includes('node_modules') ||
    filePath.includes('build') ||
    filePath.includes('dist') ||
    filePath.includes('.d.ts') ||
    filePath.includes('src/theme/') ||
    filePath.includes('src/__checks.ts')
  ) {
    return;
  }

  // Only check TypeScript and TSX files
  if (!filePath.match(/\.(ts|tsx)$/)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for violations
    violationPatterns.forEach((vPattern) => {
      const matches = content.matchAll(vPattern.pattern);
      for (const match of matches) {
        // Skip if in comments or strings
        if (
          content.substring(Math.max(0, match.index! - 20), match.index).includes('//')
        ) {
          continue;
        }

        // Special handling for color patterns - check if it's an approved color
        if (vPattern.code === 'DSV001') {
          const colorMatch = match[0].match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
          if (colorMatch && APPROVED_COLORS.has(colorMatch[0].toLowerCase())) {
            // This is an approved color, skip it
            continue;
          }
        }

        violations.push({
          file: filePath,
          line: getLineNumber(content, match.index!),
          column: match.index! - content.lastIndexOf('\n', match.index!) - 1,
          message: vPattern.message,
          code: vPattern.code,
          severity: vPattern.severity,
        });
      }
    });

    // Check component usage patterns
    componentPatterns.forEach((cPattern) => {
      const matches = content.matchAll(cPattern.pattern);
      for (const match of matches) {
        violations.push({
          file: filePath,
          line: getLineNumber(content, match.index!),
          column: match.index! - content.lastIndexOf('\n', match.index!) - 1,
          message: cPattern.message,
          code: cPattern.code,
          severity: cPattern.severity,
        });
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

function walkDirectory(dirPath: string): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDirectory(fullPath);
        }
      } else {
        checkFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }
}

// Main execution
const projectRoot = path.dirname(path.dirname(__filename));
const srcDir = path.join(projectRoot, 'src');

console.log('🔍 Checking Design System Compliance...\n');

walkDirectory(srcDir);

if (violations.length === 0) {
  console.log('✅ No design system violations found!\n');
  process.exit(0);
}

// Group violations by file
const violationsByFile = violations.reduce(
  (acc, v) => {
    if (!acc[v.file]) {
      acc[v.file] = [];
    }
    acc[v.file].push(v);
    return acc;
  },
  {} as Record<string, Violation[]>
);

// Output violations
Object.entries(violationsByFile).forEach(([file, fileViolations]) => {
  console.log(`📄 ${file}`);
  fileViolations.forEach((v) => {
    const severityIcon = v.severity === 'error' ? '❌' : '⚠️ ';
    console.log(
      `  ${severityIcon} [${v.code}:${v.line}:${v.column}] ${v.message}`
    );
  });
  console.log();
});

// Summary
const errorCount = violations.filter((v) => v.severity === 'error').length;
const warningCount = violations.filter((v) => v.severity === 'warning').length;

console.log(`📊 Summary: ${errorCount} errors, ${warningCount} warnings\n`);

if (errorCount > 0) {
  console.log('❌ Design system compliance check FAILED\n');
  process.exit(1);
} else {
  console.log('⚠️  Design system compliance check PASSED with warnings\n');
  process.exit(0);
}
