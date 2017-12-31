const facts = {
  user: {
    name: 'frank',
    stars: 761,
    address: {
      city: 'hamburg',
    },
  },
  weather: {
    temperature: 20,
    rainy: false,
    windy: true,
  },
};

const observe = (object, onChange) => {
  const handler = {
    get(target, property, receiver) {
      onChange(property);
      return Reflect.get(target, property, receiver);
    },
    defineProperty(target, property, descriptor) {
      onChange(property);
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      onChange(property);
      return Reflect.deleteProperty(target, property);
    },
  };
  return new Proxy(object, handler);
};

const proxy = observe(facts, (property) => {
  console.log('$ ', property);
});

// console.log(proxy.user);

// proxy.user.address.city = 'munich';
// proxy.user.address.city = 'frankfurt';
// proxy.user.address = { city: 'berlin' };
// proxy.user.address.street = 'bahnhofstraße';
// delete proxy.user.address.street;
//
// console.log('###', proxy.user.name);
// console.log('###', proxy.user.address.city);
//
// proxy.goWalking = true;
// delete proxy.user;
// proxy.user = { bla: true };
//
// proxy.weather.temperature = 21;

// when -> evaluate premises -> reading fact segments
// then -> fire actions -> wrinting into fact segments
