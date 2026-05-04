"use client";

import NextLink, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: ReactNode;
  };

/**
 * Project-wide `<Link>` wrapper.
 *
 * We keep the default Next.js behaviour (`scroll={true}`) so every navigation
 * jumps back to the top of the new page. Callers that need to preserve the
 * current scroll position (e.g. in-page filter links) can opt out with
 * `<AppLink href="/..." scroll={false}>`.
 */
const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink(
  props,
  ref
) {
  return <NextLink ref={ref} {...props} />;
});

export default AppLink;
