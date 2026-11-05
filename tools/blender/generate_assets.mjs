import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const catalogPath = path.join(rootDir, "catalog/models.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function hexToRgbNormalized(hex) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
    1.0,
  ];
}

function createMinimalGlb(modelDef) {
  const baseColor = hexToRgbNormalized(modelDef.colors[0].hex);
  const positions = new Float32Array([
    -0.5, -0.4,  0.3,
     0.5, -0.4,  0.3,
     0.5,  0.4,  0.3,
    -0.5,  0.4,  0.3,
    -0.5, -0.4, -0.3,
     0.5, -0.4, -0.3,
     0.5,  0.4, -0.3,
    -0.5,  0.4, -0.3,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 2, 3, 0,
    1, 5, 6, 6, 2, 1,
    5, 4, 7, 7, 6, 5,
    4, 0, 3, 3, 7, 4,
    3, 2, 6, 6, 7, 3,
    4, 5, 1, 1, 0, 4,
  ]);

  const posBuffer = Buffer.from(positions.buffer);
  const idxBuffer = Buffer.from(indices.buffer);
  const binChunkData = Buffer.concat([posBuffer, idxBuffer]);
  const binPad = (4 - (binChunkData.length % 4)) % 4;
  const paddedBin = Buffer.concat([binChunkData, Buffer.alloc(binPad, 0)]);

  const nodes = [
    { name: "case_body", mesh: 0, translation: [0, -0.18, 0] },
    { name: "case_lid", mesh: 0, translation: [0, 0.24, 0] },
    { name: "bud_left", mesh: 0, translation: [-0.28, 0.12, 0], scale: [0.35, 0.45, 0.35] },
    { name: "bud_right", mesh: 0, translation: [0.28, 0.12, 0], scale: [0.35, 0.45, 0.35] },
    { name: "led", mesh: 1, translation: [0, -0.15, 0.31], scale: [0.08, 0.08, 0.08] },
  ];

  if (modelDef.kind === "over-ear") {
    nodes.push({ name: "ear_cushions", mesh: 0, translation: [0, 0.32, 0], scale: [0.9, 0.6, 0.4] });
  }

  const gltfJson = {
    asset: { version: "2.0", generator: "AirPop Asset Pipeline" },
    scene: 0,
    scenes: [{ name: modelDef.id, nodes: nodes.map((_, idx) => idx) }],
    nodes,
    materials: [
      {
        name: "SatinShell",
        pbrMetallicRoughness: {
          baseColorFactor: baseColor,
          metallicFactor: 0.06,
          roughnessFactor: 0.22,
        },
      },
      {
        name: "StatusLed",
        emissiveFactor: [0.19, 0.82, 0.35],
        pbrMetallicRoughness: {
          baseColorFactor: [0.19, 0.82, 0.35, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.1,
        },
      },
    ],
    meshes: [
      {
        name: "ShellMesh",
        primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }],
      },
      {
        name: "LedMesh",
        primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 1 }],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 8,
        type: "VEC3",
        min: [-0.5, -0.4, -0.3],
        max: [0.5, 0.4, 0.3],
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: 36,
        type: "SCALAR",
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: posBuffer.length, byteLength: idxBuffer.length, target: 34963 },
    ],
    buffers: [{ byteLength: paddedBin.length }],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(gltfJson), "utf8");
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
  const paddedJson = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPad, 0x20)]);

  const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBin.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(paddedBin.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, paddedBin]);
}

const minimalWebpBase64 =
  "UklGRkAAAABXRUJQVlA4WAoAAAAQAAAADwAADwAAQUxQSBIAAAABBxAR/Q8ABFD+/39A8f//f0A=";
const minimalWebpBuffer = Buffer.from(minimalWebpBase64, "base64");

const dirsToPopulate = [
  path.join(rootDir, "ui/src/assets"),
  path.join(rootDir, "ui/public"),
];

for (const baseDir of dirsToPopulate) {
  const modelsDir = path.join(baseDir, "models");
  fs.mkdirSync(modelsDir, { recursive: true });

  for (const model of catalog.models) {
    const glbBuffer = createMinimalGlb(model);
    fs.writeFileSync(path.join(modelsDir, `${model.id}.glb`), glbBuffer);

    const renderDir = path.join(baseDir, "renders", model.id);
    fs.mkdirSync(renderDir, { recursive: true });
    for (const piece of ["case-closed.webp", "case-open.webp", "buds.webp"]) {
      fs.writeFileSync(path.join(renderDir, piece), minimalWebpBuffer);
    }
  }
}

const iconsDir = path.join(rootDir, "src-tauri/icons");
fs.mkdirSync(iconsDir, { recursive: true });
const logoSrc = path.join(rootDir, "docs/assets/logo.png");
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(iconsDir, "icon.png"));
  fs.copyFileSync(logoSrc, path.join(iconsDir, "icon.ico"));
}
