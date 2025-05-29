import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

register(StyleDictionary, {
  excludeParentKeys: true,
});

// letterSpacing専用の% to emトランスフォーム
StyleDictionary.registerTransform({
  name: "letterSpacing/toEm",
  type: "value",
  filter: (token) => {
    return token.$extensions?.["studio.tokens"]?.originalType === "letterSpacing";
  },
  transform: (token) => {
    const originalValue = token.original?.$value;
    if (typeof originalValue === "string" && originalValue.includes("%")) {
      const percentVal = parseFloat(originalValue);
      return `${percentVal / 100}em`;
    }
    if (typeof token.$value === "string" && token.$value === "0") {
      return "0";
    }
    return token.$value;
  },
});

// letterSpacingを除外したpx to remトランスフォーム
StyleDictionary.registerTransform({
  name: "size/pxToRemExcludeLetterSpacing",
  type: "value",
  filter: (token) => {
    // letterSpacingは除外
    if (token.$extensions?.["studio.tokens"]?.originalType === "letterSpacing") {
      return false;
    }
    // px値のみを対象
    return typeof token.$value === "string" && token.$value.includes("px");
  },
  transform: (token) => {
    const pxValue = parseFloat(token.$value);
    return `${pxValue / 16}rem`;
  },
});

const sd = new StyleDictionary({
  source: ["tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    ts: {
      prefix: "sukina",
      transforms: [
        "attribute/cti",
        "name/camel",
        "letterSpacing/toEm",
        "ts/size/px",
        "size/pxToRemExcludeLetterSpacing",
        "ts/size/lineheight",
        "ts/typography/fontWeight",
      ],
      files: [
        {
          format: "javascript/module",
          destination: "dist/tokens.js",
        },
        {
          format: "typescript/module-declarations",
          destination: "dist/tokens.d.ts",
        },
      ],
    },
  },
});

await sd.hasInitialized;
await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
