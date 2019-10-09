const babel = require('babel-core');
const plugin = require('../src/index.js');

var example = `
React.createElement("input", {
  rModel: this.state.counter,
  onChange: e => {
    console.log(e.target.value);
  }
})
`;

it('rModel and onChange test', () => {
  const {code} = babel.transform(example, {plugins: [plugin]});
  expect(code).toMatchSnapshot();
});