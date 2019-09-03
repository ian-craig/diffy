# Diffy

A simple, extensible diff tool using Electron and Microsoft's Monaco Editor.

## Extensions

On open, Diffy iterates through a list of diff providers to see if any recognize the working directory and command line arguments.
The first which returns an `IDiffProvider` instance is used to display a diff.

Diffy comes with a built in provider for Git, but more types of diffs can be added with extensions.

Extensions are npm packages, with a `package.json` whose `main` attribute points to a JavaScript file.
The extension must export a `createProvider` function which satisfies `DiffProviderFactory`.

To register an extension, add the directory containing the `package.json` to environment variable DIFFY_EXTENSIONS (semicolon separated).
