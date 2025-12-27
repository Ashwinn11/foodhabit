const fs = require('fs');
const path = require('path');

const CHARACTERS = [
  { file: 'stomach_01_love.eps', name: 'Love' },
  { file: 'stomach_02_crown.eps', name: 'Crown' },
  { file: 'stomach_03_balloon.eps', name: 'Balloon' },
  { file: 'stomach_04_ill.eps', name: 'Ill' },
  { file: 'stomach_angry.eps', name: 'Angry' },
  { file: 'stomach_confused.eps', name: 'Confused' },
  { file: 'stomach_happy.eps', name: 'Happy' },
  { file: 'stomach_sad.eps', name: 'Sad' }
];

const MASCOT_DIR = path.join(__dirname, '../mascot');
const OUTPUT_FILE = path.join(__dirname, '../src/components/GigiEmotions.tsx');

function parseColor(line) {
  const match = line.match(/\s*([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+rgb/);
  if (match) {
    const r = Math.round(parseFloat(match[1]) * 255);
    const g = Math.round(parseFloat(match[2]) * 255);
    const b = Math.round(parseFloat(match[3]) * 255);
    return `rgb(${r},${g},${b})`;
  }
  return null;
}

function convertEPSToSVG(content) {
  const lines = content.split('\n');
  const shapes = [];
  
  let currentPath = '';
  let currentColor = null; // Default null to skip pre-colored paths

  
  // Find BoundingBox
  let viewBox = '0 0 1024 1024'; // Default
  const bboxMatch = content.match(/%%BoundingBox:\s*([-\d]+)\s+([-\d]+)\s+([-\d]+)\s+([-\d]+)/);
  let height = 1024;
  
  if (bboxMatch) {
    const [_, minX, minY, maxX, maxY] = bboxMatch;
    viewBox = `${minX} ${minY} ${parseInt(maxX) - parseInt(minX)} ${parseInt(maxY) - parseInt(minY)}`;
    // Actually, simple viewbox is minX minY Width Height
    // But SVG viewBox is minX minY Width Height.
    // EPS BBox is minX minY maxX maxY.
    const width = parseInt(maxX) - parseInt(minX);
    height = parseInt(maxY) - parseInt(minY);
    viewBox = `${minX} ${minY} ${width} ${height}`;
  }

  // Regexes
  const moRe = /([.\d]+)\s+([.\d]+)\s+mo/;
  const liRe = /([.\d]+)\s+([.\d]+)\s+li/;
  const cvRe = /([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+([.\d]+)\s+cv/;
  
  for (const line of lines) {
    // Check for color
    const newColor = parseColor(line);
    if (newColor) {
        currentColor = newColor;
    }

    // Path commands
    const mo = line.match(moRe);
    if (mo) {
      currentPath += `M${mo[1]} ${mo[2]} `;
    }
    
    const li = line.match(liRe);
    if (li) {
      currentPath += `L${li[1]} ${li[2]} `;
    }

    const cv = line.match(cvRe);
    if (cv) {
      currentPath += `C${cv[1]} ${cv[2]} ${cv[3]} ${cv[4]} ${cv[5]} ${cv[6]} `;
    }

    if (line.trim() === 'cp') {
      currentPath += 'Z ';
    }

    // Fill command - emit shape
    // Note: Some files might use 'f' or 'F' or 'fill'
    // The previous analysis suggests 'f' is used.
    if (line.trim() === 'f' || line.trim() === 'fill') {
      if (currentPath.trim()) {
        if (currentColor) {
          shapes.push({
            d: currentPath.trim(),
            fill: currentColor
          });
        }
        currentPath = '';
      }
    }
  }
  
  // Dump leftover path if any (sometimes implied fill at end?)
  if (currentPath.trim() && currentColor) {
      shapes.push({
          d: currentPath.trim(),
          fill: currentColor
      });
  }

  return { viewBox, shapes, height };
}

function generateComponent() {
  let output = `import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { View, ViewStyle } from 'react-native';

interface GigiProps {
  size?: number;
  style?: ViewStyle;
}

`;

  for (const char of CHARACTERS) {
    console.log(`Processing ${char.name}...`);
    const epsPath = path.join(MASCOT_DIR, char.file);
    if (!fs.existsSync(epsPath)) {
        console.warn(`File not found: ${epsPath}`);
        continue;
    }
    
    const content = fs.readFileSync(epsPath, 'utf8');
    const { viewBox, shapes, height } = convertEPSToSVG(content);

    // Calculate aspect ratio for sizing default
    // Using viewBox width/height
    // We want to map:
    // X: minX..maxX -> 0..W
    // Y: minY..maxY -> 0..H
    // Assuming the EPS data is ALREADY Top-Down (Y=0 is top), or the user reports the flip makes it upside down.
    
    const vbParts = viewBox.split(' ');
    const vbW = parseInt(vbParts[2]);
    const vbH = parseInt(vbParts[3]);
    const minX = parseInt(vbParts[0]);
    const minY = parseInt(vbParts[1]);
    
    // Set ViewBox to normalized 0 0 W H
    const finalViewBox = `0 0 ${vbW} ${vbH}`;
    
    // Transform: Just normalize origin.
    // transform="translate(${-minX}, ${-minY})"
    
    output += `export const Gigi${char.name}: React.FC<GigiProps> = ({ size = 100, style }) => (
  <View style={[{ width: size, height: size * (${vbH}/${vbW}) }, style]}>
    <Svg viewBox="${finalViewBox}" width="100%" height="100%">
      <G transform="translate(${-minX}, ${-minY})"> 
`;

    // Remove the previous replacement block since we construct it here
    // output = output.replace(...) -> Removed

    shapes.forEach((shape, idx) => {
        output += `        <Path d="${shape.d}" fill="${shape.fill}" />\n`;
    });

    output += `      </G>
    </Svg>
  </View>
);

`;
  }
  
  // Dummy helper function for code replacement logic above (simplification)
  function maxY(h, y) { return h+y; } 

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated ${OUTPUT_FILE}`);
}

generateComponent();
