import { createMMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

const storage = createMMKV();

const zustandMMKVStorage: StateStorage = {
  setItem: (key: any, value: any) => {
    return storage.set(key, value);
  },
  getItem: (key: any) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: any) => {
    return storage.remove(key);
  },
};

export default zustandMMKVStorage;
