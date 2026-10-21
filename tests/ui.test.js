import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('export dialog keeps preview fixed and settings independently scrollable',async()=>{const css=await readFile(new URL('../src/style.css',import.meta.url),'utf8'),jsx=await readFile(new URL('../src/ExportDialog.jsx',import.meta.url),'utf8');assert.match(css,/\.export-dialog \.export-body\{overflow:hidden/);assert.match(css,/\.export-dialog \.export-settings\{[^}]*overflow-y:auto/);assert.match(jsx,/className="export-preview"[^>]*onWheel=\{wheel\}/);assert.match(jsx,/useState\(\{x:0,y:0,zoom:1\}\)/);});
test('PNG and SVG are explicit export choices',async()=>{const jsx=await readFile(new URL('../src/ExportDialog.jsx',import.meta.url),'utf8');assert.match(jsx,/SVG · vettoriale/);assert.match(jsx,/PNG · binario/);});
