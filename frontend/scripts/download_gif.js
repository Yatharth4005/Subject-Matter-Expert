const fs = require('fs');
async function run() {
  const res = await fetch('https://media.tenor.com/_q1yF07Vd-EAAAAC/anime-teacher.gif', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const buf = await res.arrayBuffer();
  fs.writeFileSync('public/teacher_speaking.gif', Buffer.from(buf));
  console.log('Downloaded', buf.byteLength, 'bytes');
}
run();
