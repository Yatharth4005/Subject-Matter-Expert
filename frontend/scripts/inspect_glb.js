const fs = require('fs');

// A simple way to inspect GLB without Three.js in Node
const data = fs.readFileSync('public/avatar.glb');
const jsonStart = 20;
const length = data.readUInt32LE(12);
const jsonChunk = data.slice(jsonStart, jsonStart + length);
try {
  const gltf = JSON.parse(jsonChunk.toString());
  console.log('Nodes:', gltf.nodes.map(n => n.name).slice(0, 10));
  console.log('Animations:', gltf.animations ? gltf.animations.map(a => a.name) : 'none');
  const meshesWithMorphs = gltf.meshes.filter(m => m.primitives.some(p => p.targets));
  console.log('Meshes with Morphs:', meshesWithMorphs.map(m => m.name));
} catch (e) {
  console.error('Failed to parse GLB JSON:', e.message);
}
