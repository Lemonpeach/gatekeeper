module.exports = {
  "extends": "standard",
  "env": {
    "jest": true
  },
  "rules": {
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "semi": ["error", "always"],
  }
};
