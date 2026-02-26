"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}

// Could not find a declaration file for module 'bootstrap/dist/js/bootstrap.bundle.min.js'. 'd:/axplore/staff_bridges/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js' implicitly has an 'any' type.
//   If the 'bootstrap' package actually exposes this module, consider sending a pull request to amend 'https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/bootstrap'ts(701