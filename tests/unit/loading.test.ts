import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminLoading from "@/app/(app)/admin/loading";
import DashboardLoading from "@/app/(app)/dashboard/loading";
import PklReportLoading from "@/app/(app)/laporan-pkl/loading";
import ClassProfileLoading from "@/app/(app)/profil-kelas/loading";

const loadingPages = [
  ["profil kelas", ClassProfileLoading],
  ["laporan PKL", PklReportLoading],
  ["galeri", DashboardLoading],
  ["admin", AdminLoading],
] as const;

describe("loading skeletons", () => {
  it.each(loadingPages)(
    "%s announces loading outside the aria-busy region",
    (_label, LoadingPage) => {
      const markup = renderToStaticMarkup(createElement(LoadingPage));

      expect(markup).toContain('aria-busy="true"');
      expect(markup).toContain('role="status"');
      expect(markup).toContain('aria-live="polite"');
      expect(markup).toContain('class="visuallyHidden"');
      expect(markup).toContain('aria-hidden="true"');
      expect(markup.indexOf('role="status"')).toBeLessThan(
        markup.indexOf('aria-busy="true"'),
      );
    },
  );
});
