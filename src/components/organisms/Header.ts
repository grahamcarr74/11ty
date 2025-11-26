export interface HeaderProps {
    title?: string;
    navItems: { text: string; href: string }[];
}

export function Header({ title = 'Optimizely + 11ty', navItems }: HeaderProps): string {
    const navList = navItems.map(item => `<li><a href="${item.href}">${item.text}</a></li>`).join('');

    return `
    <header>
      <nav>
        <div class="container">
          <h1><a href="/">${title}</a></h1>
          <ul>
            ${navList}
          </ul>
        </div>
      </nav>
    </header>
  `;
}
