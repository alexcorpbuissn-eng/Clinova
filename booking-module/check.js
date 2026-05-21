const fs = require('fs');
const acorn = require('acorn');

try {
  const code = fs.readFileSync('temp.js', 'utf8');
  acorn.parse(code, { ecmaVersion: 2022 });
  console.log("Syntax is valid!");
} catch (e) {
  console.log("Syntax Error:", e.message, "at line", e.loc ? e.loc.line : "?", "column", e.loc ? e.loc.column : "?");
}
