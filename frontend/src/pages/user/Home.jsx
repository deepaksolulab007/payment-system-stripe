import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import api from "../../utils/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Home() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [elements, setElements] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  const MIN_AMOUNT = currency === "usd" ? 0.50 : 1;

  const startPayment = async () => {
    if (!amount || Number(amount) < MIN_AMOUNT) {
      alert(`Minimum amount must be at least ${MIN_AMOUNT} ${currency.toUpperCase()}`);
      return;
    }

    const stripe = await stripePromise;

    const res = await api.post("/payments/create-intent", {
      amount: Math.round(Number(amount) * 100),
      currency,
    });

    const cs = res.data.clientSecret;
    setClientSecret(cs);

    const els = stripe.elements({ clientSecret: cs });
    setElements(els);

    const paymentElement = els.create("payment");
    paymentElement.mount("#payment-element");

    document.getElementById("pay-btn").style.display = "inline-block";
    document.getElementById("cancel-btn").style.display = "inline-block";
  };

  const confirmPayment = async () => {
    const stripe = await stripePromise;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/success",
      },
    });

    if (error) {
      console.log(error);
      window.location.href = "/failed";
    }
  };

  const cancelPayment = async () => {
    if (!clientSecret) return alert("No payment to cancel");

    const paymentIntentId = clientSecret.split("_secret")[0];

    await api.post("/payments/cancel-intent", { id: paymentIntentId });

    alert("Payment cancelled!");
    window.location.href = "/";
  };

  return (
    <div style={{ padding: "30px", maxWidth: "450px", margin: "auto", position: "relative" }}>
      
      {/* 🔐 Admin login button */}
      <button
        onClick={() => window.location.href = "/admin"}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "#333",
          color: "white",
          padding: "6px 12px",
          borderRadius: "5px",
          cursor: "pointer",
          border: "none",
          fontSize: "14px"
        }}
      >
        Admin Login
      </button>

      <h1 style={{ textAlign: "center" }}>Make a Payment</h1>

      <label><b>Select Currency</b></label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      >
        <option value="usd">USD</option>
        <option value="inr">INR</option>
      </select>

      <label><b>Enter Amount ({currency.toUpperCase()})</b></label>
      <input
        type="number"
        placeholder={`Minimum ${MIN_AMOUNT} ${currency.toUpperCase()}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <p style={{ color: "red", marginBottom: "10px" }}>
        ⚠ Minimum amount: {MIN_AMOUNT} {currency.toUpperCase()}
      </p>

      <button
        onClick={startPayment}
        style={{
          width: "100%",
          padding: "10px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Start Payment
      </button>

      <div id="payment-element" style={{ marginTop: "20px" }}></div>

      <button
        id="pay-btn"
        onClick={confirmPayment}
        style={{
          display: "none",
          padding: "10px",
          background: "#2196F3",
          color: "white",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          width: "48%",
          marginRight: "4%",
        }}
      >
        Pay Now
      </button>

      <button
        id="cancel-btn"
        onClick={cancelPayment}
        style={{
          display: "none",
          padding: "10px",
          background: "#f44336",
          color: "white",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          width: "48%",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default Home;


// import React, { useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import api from "../../utils/api";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// function Home() {
//   const [amount, setAmount] = useState("");
//   const [currency, setCurrency] = useState("usd");
//   const [elements, setElements] = useState(null);
//   const [clientSecret, setClientSecret] = useState("");

//   const MIN_AMOUNT = currency === "usd" ? 0.50 : 1; // in display units

//   const startPayment = async () => {
//     if (!amount || Number(amount) < MIN_AMOUNT) {
//       alert(`Minimum amount must be at least ${MIN_AMOUNT} ${currency.toUpperCase()}`);
//       return;
//     }

//     const stripe = await stripePromise;

//     const res = await api.post("/payments/create-intent", {
//       amount: Math.round(Number(amount) * 100), // convert to cents or paise
//       currency,
//     });

//     const cs = res.data.clientSecret;
//     setClientSecret(cs);

//     const els = stripe.elements({ clientSecret: cs });
//     setElements(els);

//     const paymentElement = els.create("payment");
//     paymentElement.mount("#payment-element");

//     document.getElementById("pay-btn").style.display = "inline-block";
//     document.getElementById("cancel-btn").style.display = "inline-block";
//   };

//   const confirmPayment = async () => {
//     const stripe = await stripePromise;

//     const { error } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: "http://localhost:5173/success",
//       },
//     });

//     if (error) {
//       console.log(error);
//       window.location.href = "/failed";
//     }
//   };

//   const cancelPayment = async () => {
//     if (!clientSecret) return alert("No payment to cancel");

//     const paymentIntentId = clientSecret.split("_secret")[0];

//     await api.post("/payments/cancel-intent", { id: paymentIntentId });

//     alert("Payment cancelled!");
//     window.location.href = "/";
//   };

//   return (
//     <div style={{ padding: "30px", maxWidth: "450px", margin: "auto" }}>
//       <h1 style={{ textAlign: "center" }}>Make a Payment</h1>

//       <label><b>Select Currency</b></label>
//       <select
//         value={currency}
//         onChange={(e) => setCurrency(e.target.value)}
//         style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
//       >
//         <option value="usd">USD</option>
//         <option value="inr">INR</option>
//       </select>

//       <label><b>Enter Amount ({currency.toUpperCase()})</b></label>
//       <input
//         type="number"
//         placeholder={`Minimum ${MIN_AMOUNT} ${currency.toUpperCase()}`}
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//         style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
//       />

//       <p style={{ color: "red", marginBottom: "10px" }}>
//         ⚠ Minimum amount: {MIN_AMOUNT} {currency.toUpperCase()}
//       </p>

//       <button
//         onClick={startPayment}
//         style={{
//           width: "100%",
//           padding: "10px",
//           background: "#4CAF50",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//           marginBottom: "20px",
//         }}
//       >
//         Start Payment
//       </button>

//       <div id="payment-element" style={{ marginTop: "20px" }}></div>

//       <button
//         id="pay-btn"
//         onClick={confirmPayment}
//         style={{
//           display: "none",
//           padding: "10px",
//           background: "#2196F3",
//           color: "white",
//           borderRadius: "5px",
//           border: "none",
//           cursor: "pointer",
//           width: "48%",
//           marginRight: "4%",
//         }}
//       >
//         Pay Now
//       </button>

//       <button
//         id="cancel-btn"
//         onClick={cancelPayment}
//         style={{
//           display: "none",
//           padding: "10px",
//           background: "#f44336",
//           color: "white",
//           borderRadius: "5px",
//           border: "none",
//           cursor: "pointer",
//           width: "48%",
//         }}
//       >
//         Cancel
//       </button>
//     </div>
//   );
// }

// export default Home;
