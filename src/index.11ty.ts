import { readableDate, truncate } from './_includes/helpers';
import { BlankExperienceTemplate } from './components/templates/BlankExperienceTemplate';

interface IndexData {
  home?: any;
}

export const data = {
  layout: "base.11ty.ts",
  title: "Home - Optimizely + 11ty POC"
};

export function render({ home }: IndexData): string {
  const heroContent = home
    ? BlankExperienceTemplate({
      title: home.Title || home.Heading || home._metadata.displayName,
      types: home._metadata.types,
      lastModified: readableDate(home._metadata.lastModified),
      key: home._metadata.key
    })
    : `<div class="hero">
         <h1>Optimizely Content Graph + 11ty</h1>
         <p>This is a proof of concept demonstrating how to use 11ty to build a static site with content from Optimizely SaaS CMS using Content Graph.</p>
       </div>`;

  return `
${heroContent}
`;
}
