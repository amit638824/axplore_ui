"use client";

import React, { useState } from "react";
import SalesPersonSelector from "./SalesPersonSelector";
import BranchSelector from "./BranchSelector";

export default function SalesPersonBranchSection() {
  const [branchId, setBranchId] = useState("");

  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group row mb-2" data-field="salesUserId">
            <label
              htmlFor="salesPerson"
              className="col-lg-3 col-form-label text-end"
            >
              Sales Person<span className="redastrick">*</span>
            </label>
            <SalesPersonSelector
              name="salesPerson"
              onBranchChange={setBranchId}
            />
            <div id="step1-error-salesUserId" className="invalid-feedback d-block col-lg-9" style={{ display: "none" }} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group row mb-2" data-field="salesBranchId">
            <label htmlFor="branch" className="col-lg-3 col-form-label text-end">
              Branch<span className="redastrick">*</span>
            </label>
            <BranchSelector
              name="branch"
              value={branchId}
              onChange={setBranchId}
            />
            <div id="step1-error-salesBranchId" className="invalid-feedback d-block col-lg-9" style={{ display: "none" }} />
          </div>
        </div>
      </div>
    </>
  );
}
