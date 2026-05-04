"use client";

import NextLink, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: ReactNode;
  };

/**
 * Project-wide `<Link>` replacement that never scrolls to top on navigation.
 *
 * Next.js's default behaviour is to call `window.scrollTo(0, 0)` after every
 * route change. Combined with any CSS transitions on <Navbar> (which reacts
 * to `scrollY` crossing its threshold), that produces visible jitter during
 * the page enter animation. Preserving the scroll position makes client-side
 * navigation feel instantaneous.
 *
 * Callers that *do* want a scroll-to-top (rare) can still opt in explicitly:
 *   <AppLink href="/..." scroll>
 */
const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink(
  { scroll = false, ...rest },
  ref
) {
  return <NextLink ref={ref} scroll={scroll} {...rest} />;
});

export default AppLink;
