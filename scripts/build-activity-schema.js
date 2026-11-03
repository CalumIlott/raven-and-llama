const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020').default;
const standaloneCode = require('ajv/dist/standalone').default;

const schemaPath = path.resolve(__dirname, '../public/schemas/activity-v1.schema.json');
const outputDirectory = path.resolve(__dirname, '../public/js/vendor');
const outputPath = path.join(outputDirectory, 'activity-validator.js');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, code: { source: true }, strict: true });

ajv.addSchema(schema);
const validator = standaloneCode(ajv, { validateActivityDefinition: schema.$id });
const browserScript = `(function (global) {
  const exports = {};
  const require = id => {
    if (id === 'ajv/dist/runtime/ucs2length') {
      return { default: value => [...value].length };
    }
    throw new Error(\`Unsupported activity validator dependency: \${id}\`);
  };
  ${validator}
  global.validateActivityDefinition = exports.validateActivityDefinition;
})(window);
`;

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, browserScript);
