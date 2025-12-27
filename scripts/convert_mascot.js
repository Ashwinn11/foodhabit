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
  
  let bbox = { minX: 0, minY: 0, maxX: 1024, maxY: 1024 };
  if (bboxMatch) {
      bbox.minX = parseFloat(bboxMatch[1]);
      bbox.minY = parseFloat(bboxMatch[2]);
      bbox.maxX = parseFloat(bboxMatch[3]);
      bbox.maxY = parseFloat(bboxMatch[4]);
  }

  let subPaths = [];
  let currentSubPath = '';

  for (const line of lines) {
    // Check for color
    const newColor = parseColor(line);
    if (newColor) {
        currentColor = newColor;
    }

    // Path commands
    const mo = line.match(moRe);
    if (mo) {
      if (currentSubPath.trim()) subPaths.push(currentSubPath.trim());
      currentSubPath = `M${mo[1]} ${mo[2]} `;
    }
    
    const li = line.match(liRe);
    if (li) {
      currentSubPath += `L${li[1]} ${li[2]} `;
    }

    const cv = line.match(cvRe);
    if (cv) {
      currentSubPath += `C${cv[1]} ${cv[2]} ${cv[3]} ${cv[4]} ${cv[5]} ${cv[6]} `;
    }

    if (line.trim() === 'cp') {
      currentSubPath += 'Z ';
    }

    // Fill command - emit shape
    if (line.trim() === 'f' || line.trim() === 'fill') {
      if (currentSubPath.trim()) subPaths.push(currentSubPath.trim());
      
      if (subPaths.length > 0) {
        let effectiveColor = currentColor;
        
        let cleanedPaths = subPaths;

        if (!currentColor) {
            // Filter out BBox artifacts
            cleanedPaths = subPaths.filter(p => {
                // Check if this path is a simple rectangle matching BBox (approx)
                // A simple rect is usually M x y L x y L x y L x y Z with NO curves 'C'
                if (p.includes('C')) return true; // Keep curves
                
                // Very rough check for BBox extents
                // If it contains ALL 4 corners roughly, it's likely the box.
                // We'll just check if it's purely linear and touches min and max of both axes.
                
                // Extractall numbers
                const matches = p.match(/[0-9.]+/g);
                if (!matches) return true; // Keep weird paths if we can't parse them (safest)
                const nums = matches.map(parseFloat);
                if (nums.length < 4) return true;
                
                const pMinX = Math.min(...nums.filter((_, i) => i % 2 === 0));
                const pMaxX = Math.max(...nums.filter((_, i) => i % 2 === 0));
                const pMinY = Math.min(...nums.filter((_, i) => i % 2 !== 0));
                const pMaxY = Math.max(...nums.filter((_, i) => i % 2 !== 0));
                
                const tolerance = 2.0; 
                const matchesBBox = 
                    Math.abs(pMinX - bbox.minX) < tolerance &&
                    Math.abs(pMaxX - bbox.maxX) < tolerance &&
                    Math.abs(pMinY - bbox.minY) < tolerance &&
                    Math.abs(pMaxY - bbox.maxY) < tolerance;
                
                // If matches BBox exactly and has no curves, DROP IT.
                return !matchesBBox;
            });

            // If we have remaining paths and they look like content (have curves), invoke default
            // User feedback: Legs were black, hands were red. Legs should match hands.
            // Using the standard maroon/dark red outline color found elsewhere: rgb(164,6,52)
            const hasCurves = cleanedPaths.some(p => p.includes('C'));
            if (hasCurves && cleanedPaths.length > 0) {
                effectiveColor = 'rgb(164,6,52)';
            }
        }

        if (effectiveColor && cleanedPaths.length > 0) {
          shapes.push({
            d: cleanedPaths.join(' '),
            fill: effectiveColor
          });
        }
        
        subPaths = [];
        currentSubPath = '';
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
