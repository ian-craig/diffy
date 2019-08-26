import * as path from 'path';
import * as fs from 'fs';
import { ProviderFactory } from "./DataStructures/IProvider";
import { app } from "electron";

export const getProviders = () => {
    // Built in providers
    const providers: ProviderFactory[] = [
        require('./Providers/GitProvider').default,
    ];
    
    const providersRoot = app.isPackaged ? `${path.dirname(app.getPath('exe'))}-providers` : `${app.getAppPath()}-providers`;
    console.log(`Searching for providers in ${providersRoot}`);

    if (fs.existsSync(providersRoot)) {
        fs.readdirSync(providersRoot).forEach(providerDir => {
            if (fs.existsSync(path.join(providersRoot, providerDir, "package.json"))) {
                const pkg = require(path.join(providersRoot, providerDir, "package.json"));
                const mainFileFullPath = path.join(providersRoot, providerDir, pkg.main);
                if (pkg.main && fs.existsSync(mainFileFullPath)) {
                    console.log(`Adding provider ${mainFileFullPath}`);
                    providers.push(require(mainFileFullPath).default);
                }
            }
        });
    }

    return providers;
}