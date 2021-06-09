module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:import/errors', 'plugin:import/warnings', 'plugin:@typescript-eslint/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    ignorePatterns: [
        '/dist*/**/*', // Ignore built files.
        '.eslintrc.js',
    ],
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        quotes: ['error', 'double'],
        indent: ['error', 4],
        'max-len': 'off',
        '@typescript-eslint/no-var-requires': 0,
    },
    globals: {
        navigator: true,
        window: true,
        document: true,
        fetch: true,
        Event: true,
        DOMParser: true,
        $: true,
    },
};
