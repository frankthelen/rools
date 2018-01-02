const good = {
  temperature: 20,
  humidity: 39,
  pressure: 1319,
  windy: true,
  rainy: false,
};

const bad = {
  temperature: 9,
  humidity: 89,
  pressure: 1013,
  windy: true,
  rainy: true,
};

module.exports = () => ({
  good: JSON.parse(JSON.stringify(good)),
  bad: JSON.parse(JSON.stringify(bad)),
});
