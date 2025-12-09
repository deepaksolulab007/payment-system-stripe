import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const loadRefunds = async () => {
    try {
      const res = await API.get("/refunds/db-list");
      setRefunds(res.data);
    } catch (err) {
      console.error("Failed to fetch refunds", err);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await API.get("/payment/recent"); // we created this backend API
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    }
  };

  useEffect(() => {
    Promise.all([loadRefunds(), loadPayments()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const createRefund = async () => {
    if (!paymentIntentId) return alert("Enter PaymentIntent ID");

    try {
      await API.post("/refunds/create", {
        paymentIntentId,
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason || undefined,
      });

      alert("Refund created!");
      setPaymentIntentId("");
      setRefundAmount("");
      setRefundReason("");

      loadRefunds();
    } catch (err) {
      console.error("Failed to create refund", err);
      alert(err?.response?.data?.message || "Refund error");
    }
  };

  return (
    <AdminLayout>
      <h1>Refund Management</h1>

      {/* Refund form */}
      <h3>Create Refund</h3>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="PaymentIntent ID"
          value={paymentIntentId}
          onChange={(e) => setPaymentIntentId(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <input
          type="number"
          placeholder="Amount (In cent/paise)"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <select
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        >
          <option value="">No Reason</option>
          <option value="requested_by_customer">Requested by Customer</option>
          <option value="duplicate">Duplicate</option>
          <option value="fraudulent">Fraudulent</option>
        </select>

        <button onClick={createRefund} style={{ padding: "6px 12px" }}>
          Create Refund
        </button>
      </div>

      {/* Refund table */}
      <h3>Refund Records</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Refund ID</th>
              <th>PaymentIntent ID</th>
              <th>Charge ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {refunds.map((r, index) => (
              <tr key={`${r.refundId}-${index}`}>
                <td>{r.refundId}</td>
                <td>{r.paymentIntentId}</td>
                <td>{r.chargeId || "—"}</td>
                <td>{r.amount}</td>
                <td>{r.status}</td>
                <td>{r.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
            {/* Recent payments list */}
      <h3>Last 10 Payments</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>PaymentIntent ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, index) => (
            <tr key={`${p.paymentIntentId}-${index}`}>
              <td>{p.paymentIntentId}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
