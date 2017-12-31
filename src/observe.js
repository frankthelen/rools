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

module.exports = observe;
