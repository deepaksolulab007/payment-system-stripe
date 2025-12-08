import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = params.get("redirect_status");
    const intent = params.get("payment_intent");

    if (status === "succeeded") {
      navigate(`/success/${intent}`);
    } else {
      navigate(`/failed/${intent}`);
    }
  }, []);

  return <p>Processing payment result...</p>;
}

export default PaymentResult;
