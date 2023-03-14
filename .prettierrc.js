module.exports = {
  printWidth: 120,
  tabWidth: 4,
  useTabs: true,
  trailingComma: "none",
  semi: true,
  bracketSpacing: true,
  overrides: [
      {
          files: ["*.scss", "*.css"],
          options: {
              requirePragma: false,
              parser: "scss",
          },
      },
      {
          files: "*.html",
          options: {
              requirePragma: false,
              parser: "html",
              htmlWhitespaceSensitivity: "ignore",
          },
      },
      {
        files: "*.hbs",
        options: {
          requirePragma: false,
          parser: "glimmer",
          singleQuote: false,
          htmlWhitespaceSensitivity: "ignore",
        }
      }
  ],
};
