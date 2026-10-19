import {traceContours,maskToSvg} from './vectorize.js';
// Geometry stays in source-image pixels; SVG physical dimensions use mm.
// Fillets and AI remain future services, independent of React.
export const extensionPoints = Object.freeze({vectorize:traceContours,fillet:null,exportSvg:maskToSvg,generateAI:null});
