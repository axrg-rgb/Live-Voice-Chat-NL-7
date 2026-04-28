declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
  var process: {
    env: NodeJS.ProcessEnv;
  };
}

export {};