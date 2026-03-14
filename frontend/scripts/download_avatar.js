const fs = require('fs');
const https = require('https');

function download(url, path) {
    const file = fs.createWriteStream(path);
    https.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
            console.log('Redirecting to:', response.headers.location);
            download(response.headers.location, path);
            return;
        }
        if (response.statusCode !== 200) {
            console.error('Failed to download. Status:', response.statusCode);
            process.exit(1);
        }
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Downloaded successfully. Size:', fs.statSync(path).size);
            process.exit(0);
        });
    }).on('error', (err) => {
        console.error('Error:', err.message);
        process.exit(1);
    });
}

const url = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
download(url, 'public/avatar.glb');
