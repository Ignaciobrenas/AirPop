import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
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

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(typeStr, dataBuf) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const typeBuf = Buffer.from(typeStr, "ascii");
  const crcVal = crc32(Buffer.concat([typeBuf, dataBuf]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
}

function createRgbaPngBuffer(width, height) {
  const rawScanlines = Buffer.alloc(height * (1 + width * 4), 0);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawScanlines[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= width * 0.46) {
        let r = 14;
        let g = 16;
        let b = 24;
        const a = 255;

        if (Math.abs(dist - width * 0.34) < 2.8) {
          r = 48;
          g = 209;
          b = 88;
        } else if (Math.abs(dx) < width * 0.18 && Math.abs(dy - 2) < height * 0.15) {
          r = 240;
          g = 242;
          b = 247;
        }

        rawScanlines[px] = r;
        rawScanlines[px + 1] = g;
        rawScanlines[px + 2] = b;
        rawScanlines[px + 3] = a;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = zlib.deflateSync(rawScanlines);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    makePngChunk("IHDR", ihdr),
    makePngChunk("IDAT", idatData),
    makePngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createIcoFromPng(pngBuffer, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = width >= 256 ? 0 : width;
  entry[1] = height >= 256 ? 0 : height;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuffer]);
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
const png64 = createRgbaPngBuffer(64, 64);
const ico64 = createIcoFromPng(png64, 64, 64);
fs.writeFileSync(path.join(iconsDir, "icon.png"), png64);
fs.writeFileSync(path.join(iconsDir, "icon.ico"), ico64);
