import * as path from "path";
import * as fs from "fs";
import { DiffProviderFactory } from "./DataStructures/IDiffProvider";
import { createProvider as createGitProvider } from "./Providers/GitProvider";

export const getProviders = () => {
  // Built in providers
  const providerFactories: DiffProviderFactory[] = [createGitProvider];

  const extensionPaths = (process.env.DIFFY_EXTENSIONS || "")
    .split(";")
    .map(p => p.trim())
    .filter(p => !!p);

  for (const providerDir of extensionPaths) {
    console.debug(`Searching for extensions in ${providerDir}`);
    const packageJsonPath = path.join(providerDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const pkg = require(packageJsonPath);
      const mainFileFullPath = path.join(providerDir, pkg.main);
      if (pkg.main && fs.existsSync(mainFileFullPath)) {
        console.debug(`Adding provider ${mainFileFullPath}`);
        const extension = require(mainFileFullPath);
        if (extension && extension.createProvider !== undefined) providerFactories.push(extension.createProvider);
      }
    }
  }

  return providerFactories;
};
