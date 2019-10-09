
const babel = require('babel-core');
const plugin = require('../src/index.js');

var example = `
React.createElement("input", {
  rModel: this.state.counter
})
`;

it('rModel', () => {
  const {code} = babel.transform(example, {plugins: [plugin]});
  expect(code).toMatchSnapshot();
});