// Validates: (1) every schema compiles, (2) each example validates against the right
// envelope + its payload schema, (3) the error-code registry validates against its schema.
// Run: node tools/validate.mjs
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const ROOT = new URL("..", import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

function walk(dir, pred, acc = []) {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = join(dir, name);
    const st = statSync(join(ROOT, rel));
    if (st.isDirectory()) walk(rel, pred, acc);
    else if (pred(rel)) acc.push(rel);
  }
  return acc;
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

let failed = 0;
const fail = (m) => { console.error("  x " + m); failed++; };
const ok = (m) => console.log("  ok " + m);

const schemaFiles = walk("schemas", (p) => p.endsWith(".schema.json"));
for (const f of schemaFiles) {
  const s = read(f);
  try { ajv.addSchema(s, s.$id); } catch (e) { fail(`${f}: ${e.message}`); }
}
console.log("Schemas registered:", schemaFiles.length);
for (const f of schemaFiles) {
  const s = read(f);
  try { if (!ajv.getSchema(s.$id)) ajv.compile(s); ok(`compiles: ${f}`); }
  catch (e) { fail(`compile ${f}: ${e.message}`); }
}

const regValidate = ajv.getSchema("https://schemas.unero.com/errors/error-code-registry.schema.json");
if (!regValidate(read("schemas/errors/error-codes.json"))) fail("error-codes.json invalid: " + ajv.errorsText(regValidate.errors));
else ok("error-codes.json valid");

const envValidate = ajv.getSchema("https://schemas.unero.com/envelopes/event-envelope.schema.json");
for (const f of walk("examples/events", (p) => p.endsWith(".json"))) {
  const ex = read(f);
  if (!envValidate(ex)) { fail(`${f} envelope: ${ajv.errorsText(envValidate.errors)}`); continue; }
  const pv = ajv.getSchema(`https://schemas.unero.com/events/${ex.event_type}.schema.json`);
  if (!pv) { fail(`${f}: no schema for event_type ${ex.event_type}`); continue; }
  if (!pv(ex.payload)) fail(`${f} payload: ${ajv.errorsText(pv.errors)}`); else ok(`example valid: ${f}`);
}

const errValidate = ajv.getSchema("https://schemas.unero.com/envelopes/error-envelope.schema.json");
for (const f of walk("examples/errors", (p) => p.endsWith(".json"))) {
  if (!errValidate(read(f))) fail(`${f}: ${ajv.errorsText(errValidate.errors)}`); else ok(`example valid: ${f}`);
}

console.log(failed ? `\nFAILED (${failed})` : "\nALL SCHEMAS + EXAMPLES VALID");
process.exit(failed ? 1 : 0);
