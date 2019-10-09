
const babel = require('babel-core');
const plugin = require('../src/index.js');

var example = `
React.createElement("input", {
  rModel: this.state.counter,
  value: '21'
})
`;

it('rModel and value test', () => {
  const {code} = babel.transform(example, {plugins: [plugin]});
  expect(code).toMatchSnapshot();
});