import { ALL_TOOLS } from './src/data/tools.ts';

const paths = ALL_TOOLS.map(tool => ({
  params: { id: tool.id },
  props: { tool },
}));

console.log("Generated", paths.length, "paths");
console.log("First 3 IDs:", paths.slice(0, 3).map(p => p.params.id));
