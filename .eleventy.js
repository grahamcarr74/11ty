/** @type {import('@11ty/eleventy').UserConfig} */
module.exports = function(eleventyConfig) {
  // Pass through assets
  eleventyConfig.addPassthroughCopy("src/css");

  // Add a filter to format dates
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Add TypeScript template support - tsx handles the compilation
  eleventyConfig.addExtension("11ty.ts", {
    key: "11ty.js",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "11ty.ts", "11ty.js", "html"],
    markdownTemplateEngine: "11ty.js",
    htmlTemplateEngine: "11ty.js"
  };
};
