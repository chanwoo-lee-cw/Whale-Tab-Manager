let _storage = {};

global.__resetChromeMock = () => {
  _storage = {};
  chrome.tabs.query.mockReset();
  chrome.tabs.remove.mockReset();
  chrome.tabs.remove.mockResolvedValue(undefined);
  chrome.tabs.create.mockReset();
  chrome.tabs.create.mockResolvedValue(undefined);
  chrome.storage.local.get.mockReset();
  chrome.storage.local.get.mockImplementation(async keys => {
    if (typeof keys === 'string') return { [keys]: _storage[keys] };
    if (Array.isArray(keys)) return Object.fromEntries(keys.map(k => [k, _storage[k]]));
    return { ..._storage };
  });
  chrome.storage.local.set.mockReset();
  chrome.storage.local.set.mockImplementation(async items => {
    Object.assign(_storage, items);
  });
  chrome.storage.onChanged.addListener.mockReset();
  chrome.runtime.getURL.mockReset();
  chrome.runtime.getURL.mockImplementation(path => `chrome-extension://mock-id/${path}`);
};

global.chrome = {
  tabs: {
    query: jest.fn(),
    remove: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
  },
  storage: {
    local: {
      get: jest.fn(async keys => {
        if (typeof keys === 'string') return { [keys]: _storage[keys] };
        if (Array.isArray(keys)) return Object.fromEntries(keys.map(k => [k, _storage[k]]));
        return { ..._storage };
      }),
      set: jest.fn(async items => {
        Object.assign(_storage, items);
      }),
    },
    onChanged: {
      addListener: jest.fn(),
    },
  },
  runtime: {
    getURL: jest.fn(path => `chrome-extension://mock-id/${path}`),
  },
};
