type AccessHandler = (property: string | symbol) => void;

export default (object: object, onAccess: AccessHandler) => {
  const handler: ProxyHandler<object> = {
    get(target, property, receiver) {
      onAccess(property);
      return Reflect.get(target, property, receiver) as unknown;
    },
    defineProperty(target, property, descriptor) {
      onAccess(property);
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      onAccess(property);
      return Reflect.deleteProperty(target, property);
    },
  };
  return new Proxy<object>(object, handler);
};
