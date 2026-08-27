const fs = require('fs');
const path = require('path');

const players = JSON.parse(fs.readFileSync(path.join(__dirname, 'players.json'), 'utf8'));

const head   = fs.readFileSync(path.join(__dirname, 'parts', 'head.html'),   'utf8');
const body   = fs.readFileSync(path.join(__dirname, 'parts', 'body.html'),   'utf8');
const script = fs.readFileSync(path.join(__dirname, 'parts', 'script.js'),   'utf8');

const playerDataLine = `const PLAYERS = ${JSON.stringify(players, null, 2)};`;

const html = head + '\n' + body + '\n<script>\n' + playerDataLine + '\n' + script + '\n</script>\n</body>\n</html>';

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('index.html successfully assembled! Size:', html.length, 'chars');
