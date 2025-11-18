/**
 * Wraps bare LaTeX commands with proper delimiters for markdown rendering.
 * Converts patterns like \mathcal{C} to $\mathcal{C}$
 * Handles streaming text by being robust to incomplete LaTeX expressions.
 */
export function fixLatex(text: string): string {
  // First, protect already wrapped expressions from being re-wrapped
  // Match $...$ and $$...$$ blocks
  const protectedRanges: Array<{start: number; end: number}> = [];

  // Find all $...$ and $$...$$ blocks
  const dollarRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  let match;
  while ((match = dollarRegex.exec(text)) !== null) {
    protectedRanges.push({ start: match.index, end: match.index + match[0].length });
  }

  // Check if a position is protected
  const isProtected = (pos: number): boolean => {
    return protectedRanges.some(range => pos >= range.start && pos < range.end);
  };

  // Pattern to match common LaTeX commands that aren't already wrapped
  const latexCommands = [
    'mathcal', 'mathbb', 'mathbf', 'mathrm', 'mathit', 'mathsf', 'mathtt',
    'frac', 'sqrt', 'sum', 'prod', 'int', 'oint', 'lim', 'infty',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'omega',
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Sigma', 'Omega',
    'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow', 'to', 'mapsto',
    'in', 'notin', 'subset', 'subseteq', 'supseteq', 'cup', 'cap', 'emptyset',
    'cdot', 'times', 'div', 'pm', 'mp', 'leq', 'geq', 'neq', 'equiv', 'approx',
    'partial', 'nabla', 'forall', 'exists',
  ];

  const commandPattern = latexCommands.join('|');

  // Match complete LaTeX expressions:
  // 1. \command{...} with nested braces support
  // 2. \command{...}{...} for multi-argument commands like \frac
  // 3. Standalone symbols like \alpha
  // This regex captures the full expression including all arguments
  const latexRegex = new RegExp(
    `\\\\(?:${commandPattern})(?:\\{(?:[^{}]|\\{[^{}]*\\})*\\})*`,
    'g'
  );

  let result = text;
  const replacements: Array<{index: number; length: number; replacement: string}> = [];

  // Find all LaTeX commands
  while ((match = latexRegex.exec(text)) !== null) {
    // Skip if this match is already inside a protected region
    if (isProtected(match.index)) {
      continue;
    }

    const fullMatch = match[0];
    const startIndex = match.index;

    // Check what comes before and after
    const before = text[startIndex - 1] || '';
    const after = text[startIndex + fullMatch.length] || '';

    // Don't wrap if already wrapped with $ or inside \( \)
    if (before === '$' || after === '$' ||
        (before === '(' && text[startIndex - 2] === '\\') ||
        (after === ')' && text[startIndex + fullMatch.length + 1] === '\\')) {
      continue;
    }

    // Wrap with $$
    replacements.push({
      index: startIndex,
      length: fullMatch.length,
      replacement: `$${fullMatch}$`
    });
  }

  // Apply replacements in reverse order to maintain indices
  replacements.reverse().forEach(({index, length, replacement}) => {
    result = result.slice(0, index) + replacement + result.slice(index + length);
  });

  return result;
}
