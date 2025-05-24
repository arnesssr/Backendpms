interface MockDatabase {
  products: any[];
  categories: any[];
  orders: any[];
  inventory: any[];
}

declare global {
  var createMockDatabase: () => MockDatabase;
  namespace NodeJS {
    interface Global {
      createMockDatabase: () => MockDatabase;
    }
  }
}

export {}; // Convert this module into a module
