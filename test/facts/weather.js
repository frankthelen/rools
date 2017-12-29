const good = {
  temperature: 20,
  windy: true,
  rainy: false,
};

const bad = {
  temperature: 9,
  windy: true,
  rainy: true,
};

module.exports = () => ({
  good: { ...good },
  bad: { ...bad },
});
