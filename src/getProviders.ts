import * as path from 'path';
import * as fs from 'fs';
import { ProviderFactory } from "./DataStructures/IProvider";

export const getProviders = () => {
    // Built in providers
    const providers: ProviderFactory[] = [
        require('./Providers/GitProvider').default,
    ];

    const providerPaths = (process.env.MONACO_DIFF_PROVIDERS || "")
        .split(";")
        .map(p => p.trim())
        .filter(p => !!p);

    for (const providerDir of providerPaths) {
        console.debug(`Searching for provider in ${providerDir}`);
        const packageJsonPath = path.join(providerDir, "package.json");
        if (fs.existsSync(packageJsonPath)) {
            const pkg = require(packageJsonPath);
            const mainFileFullPath = path.join(providerDir, pkg.main);
            if (pkg.main && fs.existsSync(mainFileFullPath)) {
                console.debug(`Adding provider ${mainFileFullPath}`);
                providers.push(require(mainFileFullPath).default);
            }
        }
    }

    return providers;
}