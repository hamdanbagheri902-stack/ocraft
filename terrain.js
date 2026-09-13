export function terrainHeight(x, z) {
  const broad = Math.sin(x * 0.28) * 1.8 + Math.cos(z * 0.24) * 1.6;
  const detail = Math.sin((x + z) * 0.52) * 0.75 + Math.cos((x - z) * 0.37) * 0.55;
  return Math.round(broad + detail);
}

export function columnBlocks(height) {
  const blocks = [];
  const baseY = -4;
  const sandy = height <= -1;

  for (let y = baseY; y <= height; y++) {
    let type = 2;
    if (y === height) type = sandy ? 3 : 0;
    else if (y >= height - 2) type = sandy ? 3 : 1;
    blocks.push({ y, type });
  }

  return blocks;
}
