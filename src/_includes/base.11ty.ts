import { Header } from '../components/organisms/Header';
import { Footer } from '../components/organisms/Footer';

interface BaseData {
  title?: string;
  content: string;
}

export function render(data: BaseData): string {
  const title = data.title || "Optimizely + 11ty POC";

  const headerHtml = Header({
    title: 'Optimizely + 11ty',
    navItems: [
      { text: 'Home', href: '/' }
    ]
  });

  const footerHtml = Footer();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  ${headerHtml}

  <main class="container">
    ${data.content}
  </main>

  ${footerHtml}
</body>
</html>`;
}
