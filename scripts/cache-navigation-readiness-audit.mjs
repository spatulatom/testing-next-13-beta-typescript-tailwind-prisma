import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = resolve(import.meta.dirname, '..');
const nextVersion = require('next/package.json').version;

const readProjectFile = (filePath) =>
  readFileSync(resolve(projectRoot, filePath), 'utf8');

const checks = [
  {
    filePath: 'next.config.ts',
    assertions: [
      ['Cache Components are enabled', /cacheComponents:\s*true/],
    ],
  },
  {
    filePath: 'components/navigation/Nav.tsx',
    assertions: [
      ['Home nav disables prefetch', /<Link\s+href=\{['"]\/['"]\}\s+prefetch=\{false\}/],
      ['User posts nav disables prefetch', /<Link\s+href=\{['"]\/userposts['"]\}\s+prefetch=\{false\}/],
    ],
  },
  {
    filePath: 'components/navigation/HamburgerMenu.tsx',
    assertions: [
      ['Mobile Home nav disables prefetch', /href="\/"\s+prefetch=\{false\}/],
      ['Mobile User posts nav disables prefetch', /href="\/userposts"\s+prefetch=\{false\}/],
    ],
  },
  {
    filePath: 'components/posts/Post.tsx',
    assertions: [
      ['Post detail card disables prefetch', /pathname:\s*`\/\$\{id\}`[\s\S]*prefetch=\{false\}/],
    ],
  },
  {
    filePath: 'app/allPosts.tsx',
    assertions: [
      ['Feed reader is cached', /['"]use cache['"]/],
      ['Feed reader tags posts', /cacheTag\(['"]posts['"]\)/],
    ],
  },
  {
    filePath: 'app/[post]/singlepost.tsx',
    assertions: [
      ['Post reader is cached', /['"]use cache['"]/],
      ['Post reader tags posts', /cacheTag\(['"]posts['"]\)/],
      ['Post reader tags post id', /cacheTag\(`post-\$\{id\}`\)/],
    ],
  },
  {
    filePath: 'app/[post]/page.tsx',
    assertions: [
      ['Post detail cached component tags posts', /cacheTag\(['"]posts['"]\)/],
      ['Post detail cached component tags post id', /cacheTag\(`post-\$\{post\}`\)/],
      ['Post detail keeps auth outside cached component', /const session = await auth\(\);[\s\S]*<CachedPostDetail/],
    ],
  },
  {
    filePath: 'app/userposts/getUserPosts.ts',
    assertions: [
      ['User posts reader is cached', /['"]use cache['"]/],
      ['User posts reader tags user posts', /cacheTag\(`user-\$\{userId\}-posts`\)/],
    ],
  },
  {
    filePath: 'app/actions.ts',
    assertions: [
      ['Create post updates feed tag', /updateTag\(['"]posts['"]\)/],
      ['Create post updates detail tag', /updateTag\(`post-\$\{result\.id\}`\)/],
      ['Create post updates user posts tag', /updateTag\(`user-\$\{prismaUser\.id\}-posts`\)/],
    ],
  },
  {
    filePath: 'app/[post]/actions.ts',
    assertions: [
      ['Create comment updates detail tag', /updateTag\(`post-\$\{postId\}`\)/],
      ['Create comment updates feed tag', /updateTag\(['"]posts['"]\)/],
      ['Create comment updates user posts tag', /updateTag\(`user-\$\{post\.userId\}-posts`\)/],
    ],
  },
  {
    filePath: 'app/hearts/actions.ts',
    assertions: [
      ['Heart updates feed tag', /updateTag\(['"]posts['"]\)/],
      ['Heart updates detail tag', /updateTag\(`post-\$\{postId\}`\)/],
      ['Heart updates user posts tag', /updateTag\(`user-\$\{post\.userId\}-posts`\)/],
    ],
  },
  {
    filePath: 'app/userposts/actions.ts',
    assertions: [
      ['Delete updates user posts tag', /updateTag\(`user-\$\{prismaUser\.id\}-posts`\)/],
      ['Delete updates feed tag', /updateTag\(['"]posts['"]\)/],
      ['Delete updates detail tag', /updateTag\(`post-\$\{postId\}`\)/],
    ],
  },
  {
    filePath: 'CACHE_COMPONENTS_NAVIGATION_READINESS_AUDIT.md',
    assertions: [
      ['Audit records installed Next version', `Next.js version used for validation: \`${nextVersion}\``],
      ['Audit keeps stale prefetch rule', /prefetch=\{false\}/],
      ['Audit records read-only instant navigation finding', /read-only page bodies are candidates[\s\S]*shared auth nav/],
      ['Audit documents updateTag versus revalidateTag', /updateTag\(\)[\s\S]*revalidateTag\(tag, 'max'\)/],
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = readProjectFile(check.filePath);

  for (const [description, pattern] of check.assertions) {
    const matches =
      typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);

    if (!matches) {
      failures.push(`${check.filePath}: ${description}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Cache navigation readiness audit failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Cache navigation readiness audit passed for Next.js ${nextVersion}.`);
console.log(`Checked ${checks.length} policy files from ${relative(process.cwd(), projectRoot) || '.'}.`);