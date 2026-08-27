const fs = require('fs');
const path = require('path');
const players = JSON.parse(fs.readFileSync(path.join(__dirname, 'players.json'), 'utf8'));

const css1 = fs.readFileSync(path.join(__dirname, 'parts', 'v2_css1.html'), 'utf8');
const css2 = fs.readFileSync(path.join(__dirname, 'parts', 'v2_css2.html'), 'utf8');
const body = fs.readFileSync(path.join(__dirname, 'parts', 'v2_body.html'), 'utf8');
const js1  = fs.readFileSync(path.join(__dirname, 'parts', 'v2_js1.js'),   'utf8');
const js2  = fs.readFileSync(path.join(__dirname, 'parts', 'v2_js2.js'),   'utf8');

const playerData = `const PLAYERS = ${JSON.stringify(players, null, 2)};`;
const html = css1 + css2 + body + playerData + '\n' + js1 + '\n' + js2 + '\n</script>\n</body>\n</html>';

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('Done! Lines:', html.split('\n').length, '  Size:', Math.round(html.length / 1024) + 'KB');
