# React Children & Props — A Reference Across 3 Scenarios

> A vertical deep-dive into how `children`, `children.props`, and route props
> work differently in vanilla React, React Router, and Next.js App Router.

## Table of Contents

1. [Foundation: two things to keep separate](#1-foundation-two-things-to-keep-separate)
2. [The React element object](#2-the-react-element-object)
3. [Scenario 1 — Vanilla React](#3-scenario-1--vanilla-react)
4. [Scenario 2 — React Router](#4-scenario-2--react-router)
5. [Scenario 3 — Next.js App Router (v16)](#5-scenario-3--nextjs-app-router-v16)
6. [Key conclusions from this whole topic](#6-key-conclusions-from-this-whole-topic)
7. [Quick comparison table](#7-quick-comparison-table)

---

## 1. Foundation: two things to keep separate

### Definition phase — when you write the component

```jsx
function MyComponent(props) {
  return <div>Hello</div>;
}
```

At this point it is just a plain JavaScript function. Nothing has run yet.

### Call phase — when React actually runs it

JSX syntax is not a direct function call. When you write:

```jsx
<Parent>
  <Child foo="hello" />
</Parent>
```

the compiler turns it into element creation calls:

```js
jsx(Parent, {
  children: jsx(Child, { foo: 'hello' }),
});
```

`jsx()` creates a **React element object** — a plain data description.  
React then reads that tree and decides when to invoke the component functions.

**Key rule:**

- JSX declares the tree.
- React controls invocation.
- You never call component functions directly.

---

## 2. The React element object

A React element is just a plain object created by JSX:

```js
{
  type: Child,           // the component function
  props: { foo: 'hello' } // always an object, even if empty
}
```

Two important facts:

- `props` is **always** present on a React element, even if no props were passed (it will be `{}`).
- A missing prop is `undefined`, not an error.

```jsx
// Safe: children.props always exists on a valid element
// children.props.foo is undefined if foo was not passed — not a crash
if (React.isValidElement(children)) {
  console.log(children.props.foo); // undefined if not passed
}
```

However, `children` itself is not always a React element. It can be text, an
array, a fragment, `null`, or `undefined`. That is why `React.isValidElement()`
is the required guard before touching `children.props`.

---

## 3. Scenario 1 — Vanilla React

### How children works

```jsx
// Parent.jsx
function Parent({ children }) {
  return <div>{children}</div>;
}

// Child.jsx
function Child({ foo }) {
  return <p>foo = {foo}</p>;
}

// App.jsx
function App() {
  return (
    <Parent>
      <Child foo="hello" />
    </Parent>
  );
}
```

What happens at runtime:

1. JSX creates element objects for `Parent` and `Child`.
2. React renders `Parent`, which receives `props.children`.
3. `children` is `ReactNode` — it can be an element, text, array, fragment, `null`, etc.
4. React renders the child elements as it traverses the tree.
5. `Child` receives its own `foo` prop inside itself.

### Can the parent read the child's props?

Yes, but only as a special-case advanced pattern:

```jsx
import { isValidElement, cloneElement } from 'react';

function Parent({ children }) {
  if (isValidElement(children)) {
    // children.props is safe here because we checked first
    console.log(children.props.foo); // "hello" (or undefined if not passed)

    // You can also inject extra props — advanced, use sparingly
    const enhanced = cloneElement(children, { extra: 'injected' });
    return <div>{enhanced}</div>;
  }
  return <div>{children}</div>;
}
```

**Why is this not the default pattern?**  
Because `children` is not guaranteed to be a single React element. For everyday
data flow, pass props explicitly or use context. `children.props` is reserved for
rare cases like slot-like wrappers, design system primitives, or element cloning
utilities.

### Summary

| Question                                 | Answer                                                          |
| ---------------------------------------- | --------------------------------------------------------------- |
| Can child access its own props?          | Yes, always, inside the child itself                            |
| Can parent access child's props?         | Only via `children.props`, only when `isValidElement()` is true |
| Is `children.props` common?              | No — advanced, special-case only                                |
| Is `props` always present on an element? | Yes — it is always an object                                    |

---

## 4. Scenario 2 — React Router

### The important correction

React Router nested routes do **not** use `children` or `children.props` to pass
child route UI into a parent. The mechanism is `Outlet`.

```jsx
import { Outlet } from 'react-router-dom';

// Parent layout route
function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* ← React Router puts the matched child route here */}
    </div>
  );
}

// Child route
function DashboardReports() {
  return <main>Reports UI</main>;
}
```

```jsx
// Router setup
<BrowserRouter>
  <Routes>
    <Route path="/dashboard" element={<DashboardLayout />}>
      <Route path="reports" element={<DashboardReports />} />
    </Route>
  </Routes>
</BrowserRouter>
```

What happens:

- React Router matches the URL.
- It renders `DashboardLayout` for `/dashboard/reports`.
- `Outlet` inside the layout is filled with `DashboardReports`.
- `DashboardLayout` never receives `DashboardReports` as `children.props`.
- `DashboardLayout` has no visibility into `DashboardReports`'s props.

### Manual JSX inside a route component behaves like Scenario 1

If you write nested JSX yourself inside a route component, that is just plain
React composition — no Outlet, no router magic:

```jsx
function DashboardPage() {
  return (
    <Parent>
      <Child foo="hello" /> {/* ← this is plain React, not Router nesting */}
    </Parent>
  );
}
```

In this case `Parent` can inspect `children.props` exactly as in Scenario 1,
but that is unrelated to React Router's routing mechanism.

### Summary

| Question                                 | Answer                                          |
| ---------------------------------------- | ----------------------------------------------- |
| How does React Router nest UI?           | Via `Outlet`, not `children`                    |
| Can parent route read child route props? | No — `Outlet` is opaque in both directions      |
| Manual JSX inside a route component?     | Behaves exactly like vanilla React (Scenario 1) |
| Where do route params come from?         | `useParams()` hook inside any route component   |

---

## 5. Scenario 3 — Next.js App Router (v16)

### Routing is file-system based

Next.js derives routes from the folder structure, not from `children`:

```
app/
  layout.tsx          ← wraps everything
  dashboard/
    layout.tsx        ← wraps the dashboard segment
    [slug]/
      page.tsx        ← the actual page for /dashboard/some-slug
```

### `children` in layouts is a render slot, not a props channel

A layout receives `children` so it can place the matched nested segment in the
right spot:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>{' '}
      {/* ← render slot, not a children.props channel */}
    </html>
  );
}
```

`children` here is opaque rendered content. You cannot reliably read `children.props`
to get route data. The layout does not and should not know what specific page is
inside it.

### Route props come from the router, not from children.props

Pages receive route data as **framework-injected props**:

```tsx
// app/dashboard/[slug]/page.tsx
export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params; // from URL segment /dashboard/my-slug
  const { filter } = await searchParams; // from query string ?filter=active
  return <p>Slug: {slug}</p>;
}
```

In Next.js 16, `params` and `searchParams` are **async** — synchronous access is
fully removed. Use `await params` in async Server Components, or `use(params)` in
Client Components.

Layouts can also receive `params` for their own dynamic segment:

```tsx
// app/dashboard/[team]/layout.tsx
export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  return (
    <div>
      <TeamHeader team={team} />
      {children}
    </div>
  );
}
```

### `params`/`searchParams` are props — but not `children.props`

This is an important distinction:

- `params` and `searchParams` are standard JavaScript function arguments (props).
- They are injected by the Next.js router, derived from the URL at request time.
- They have nothing to do with the `children.props` inspection pattern.
- `children` is just where the matched nested UI is placed.

### Layout caveats (documented behavior)

Layouts are cached and reused across navigations, which means:

| What you need                   | How to get it                                                               |
| ------------------------------- | --------------------------------------------------------------------------- |
| URL query string in layout      | Client Component with `useSearchParams()`                                   |
| Current pathname in layout      | Client Component with `usePathname()`                                       |
| Pass data from layout to page   | You can't — fetch the same data in both, use React `cache()` to deduplicate |
| Dynamic segment value in layout | Async `params` prop                                                         |

### Summary

| Question                                 | Answer                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| Do Next.js route components have props?  | Yes — `params` and `searchParams` (async in v16)          |
| Are those route props `children.props`?  | No — they are router-injected from the URL                |
| Can layout read page's `children.props`? | Not reliably — `children` is a render slot                |
| How does layout get route data?          | Async `params` for its own segment; page handles the rest |

---

## 6. Key conclusions from this whole topic

1. **`children` is `ReactNode`** — not always a single element. Treat it as render
   content unless you have specifically guarded with `isValidElement()`.

2. **`children.props` is advanced and rare** — useful for slot wrappers and element
   cloning, not for everyday data flow.

3. **React Router uses `Outlet`**, not `children`, for nested route UI. Manual JSX
   composition inside a route component is just plain React.

4. **Next.js `layout.children` is a render slot** — the closest analog to React
   Router's `Outlet`. It is not a `children.props` inspection channel.

5. **Next.js route props (`params`, `searchParams`) are router-injected props** —
   derived from the URL at request time, not from React child composition. In v16
   they are async and must be awaited.

6. **For everyday data flow use**: explicit props → context → lifting state.
   Reserve `children.props` only when you truly need to inspect or enhance a known
   single child element.

---

## 7. Quick comparison table

| Concept                        | Vanilla React                      | React Router                       | Next.js App Router (v16)              |
| ------------------------------ | ---------------------------------- | ---------------------------------- | ------------------------------------- |
| Component definition           | Normal function                    | Normal function                    | Normal function                       |
| JSX primarily does             | Creates React elements             | Creates React elements             | Creates React elements                |
| Who invokes components         | React renderer                     | React renderer                     | React renderer + App Router           |
| Nested UI mechanism            | Manual JSX composition             | `Outlet`                           | `children` render slot                |
| `children` type                | `ReactNode`                        | `ReactNode`                        | `ReactNode` in layouts                |
| `children.props` reliable?     | Only with `isValidElement()` guard | Same caveat                        | Not a stable pattern                  |
| `cloneElement`                 | Advanced / rare                    | Advanced / rare                    | Not for layout-to-page flow           |
| Route data source              | Your own props/state/context       | `useParams()`, `useSearchParams()` | Async `params` + `searchParams` props |
| `params`/`searchParams` async? | n/a                                | No (synchronous URL params)        | Yes — must `await` in v16             |
