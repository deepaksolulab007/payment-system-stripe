// import React, { useEffect, useState } from "react";
// import API from "../../utils/api";
// import AdminLayout from "../../components/AdminLayout";
// import "./Dashboard.css";

// export default function AdminDashboard() {
//   const [stats, setStats] = useState(null);
//   const [platformBalance, setPlatformBalance] = useState(null);

//   const [accountId, setAccountId] = useState("");
//   const [connectedBalance, setConnectedBalance] = useState(null);

//   const [accounts, setAccounts] = useState([]);

//   // NEW: onboarding link state
//   const [onboardingUrl, setOnboardingUrl] = useState("");

//   // ---------------- LOAD DASHBOARD STATS ----------------
//   useEffect(() => {
//     API.get("/admin/stats")
//       .then((res) => setStats(res.data))
//       .catch(() => alert("Error loading dashboard stats"));

//     loadPlatformBalance();
//     loadAccounts();
//   }, []);

//   // ---------------- PLATFORM BALANCE ----------------
//   const loadPlatformBalance = async () => {
//     try {
//       const res = await API.get("/payout/platform-balance");
//       setPlatformBalance(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ---------------- CONNECTED ACCOUNT BALANCE ----------------
//   const getConnectedBalance = async () => {
//     if (!accountId) return alert("Enter an account_id");

//     try {
//       const res = await API.post("/payout/balance", { accountId });
//       setConnectedBalance(res.data);
//     } catch (err) {
//       alert("Invalid account ID");
//     }
//   };

//   // ---------------- LIST CONNECTED ACCOUNTS ----------------
//   const loadAccounts = async () => {
//     try {
//       const res = await API.get("/payout/all-accounts");
//       setAccounts(res.data.data || []);
//     } catch (err) {
//       console.error("Cannot load accounts", err);
//     }
//   };

//   // ---------------- CREATE NEW CONNECT ACCOUNT ----------------
//   const createNewAccount = async () => {
//     const email = prompt("Enter email for new connected account:");

//     if (!email) return;

//     try {
//       const res = await API.post("/payout/create-account", { email });
//       alert("Account created!");

//       // Show onboarding link
//       setOnboardingUrl(res.data.onboardingUrl);

//       // Refresh account table
//       loadAccounts();
//     } catch (err) {
//       alert("Failed to create account");
//     }
//   };

//   // ---------------- ONBOARD EXISTING ACCOUNT ----------------
//   const onboardExistingAccount = async (accId) => {
//     try {
//       const res = await API.get(`/payout/onboarding-link/${accId}`);

//       setOnboardingUrl(res.data.url);
//       alert("Onboarding link generated!");
//     } catch (err) {
//       console.error(err);
//       alert("Unable to generate onboarding link");
//     }
//   };

//   // ---------------- CHECK STATUS ----------------
//   const checkAccountStatus = async (accId) => {
//     try {
//       const res = await API.get(`/payout/account-status/${accId}`);
//       alert("Status updated! Check table again.");

//       loadAccounts();
//     } catch (err) {
//       console.error(err);
//       alert("Cannot fetch account status");
//     }
//   };

//   return (
//     <AdminLayout>
//       <h1>Admin Dashboard</h1>

//       {/* ---------------- CREATE CONNECT ACCOUNT BUTTON ---------------- */}
//       <div className="create-acc-box">
//         <button className="create-btn" onClick={createNewAccount}>
//           ➕ Create New Connected Account
//         </button>
//       </div>

//       {/* SHOW ONBOARDING URL */}
//       {onboardingUrl && (
//         <div className="onboard-box">
//           <p>Onboarding Link:</p>
//           <a href={onboardingUrl} target="_blank" rel="noreferrer">
//             {onboardingUrl}
//           </a>
//         </div>
//       )}

//       {/* -------- Stats Cards -------- */}
//       {stats && (
//         <div className="stats-container">
//           <div className="stat-card green">Total Payments: {stats.totalPayments}</div>
//           <div className="stat-card red">Failed Payments: {stats.failedPayments}</div>
//           <div className="stat-card blue">Total Refunds: {stats.totalRefunds}</div>
//           <div className="stat-card yellow">Total Payouts: {stats.totalPayouts}</div>
//           <div className="stat-card red">Failed Payouts: {stats.failedPayouts}</div>
//         </div>
//       )}

//       {/* -------- PLATFORM BALANCE -------- */}
//       <h2>Platform Stripe Balance</h2>
//       {platformBalance ? (
//         <pre className="balance-box">
// Available: {platformBalance.available[0]?.amount} {platformBalance.available[0]?.currency}
// Pending:   {platformBalance.pending[0]?.amount} {platformBalance.pending[0]?.currency}
//         </pre>
//       ) : (
//         <p>Loading platform balance...</p>
//       )}

//       {/* -------- CONNECTED ACCOUNT BALANCE -------- */}
//       <h2>Connected Account Balance</h2>
//       <input
//         type="text"
//         placeholder="Enter account_id"
//         value={accountId}
//         onChange={(e) => setAccountId(e.target.value)}
//       />
//       <button onClick={getConnectedBalance}>Check Balance</button>

//       {connectedBalance && (
//         <pre className="balance-box">
// Available: {connectedBalance.available[0]?.amount} {connectedBalance.available[0]?.currency}
// Pending:   {connectedBalance.pending[0]?.amount} {connectedBalance.pending[0]?.currency}
//         </pre>
//       )}

//       {/* -------- CONNECTED ACCOUNTS TABLE -------- */}
//       <h2>All Connected Accounts</h2>
//       <table className="accounts-table">
//         <thead>
//           <tr>
//             <th>Account ID</th>
//             <th>Email</th>
//             <th>Payouts Enabled</th>
//             <th>Charges Enabled</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {accounts.map((acc) => (
//             <tr key={acc.id}>
//               <td>{acc.id}</td>
//               <td>{acc.email || "—"}</td>
//               <td>{acc.payouts_enabled ? "🟢 Yes" : "🔴 No"}</td>
//               <td>{acc.charges_enabled ? "🟢 Yes" : "🔴 No"}</td>

//               <td>
//                 <button
//                   className="small-btn"
//                   onClick={() => onboardExistingAccount(acc.id)}
//                 >
//                   Onboard
//                 </button>

//                 <button
//                   className="small-btn"
//                   onClick={() => checkAccountStatus(acc.id)}
//                 >
//                   Refresh Status
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </AdminLayout>
//   );
// }



import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [platformBalance, setPlatformBalance] = useState(null);

  const [accountId, setAccountId] = useState("");
  const [connectedBalance, setConnectedBalance] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [onboardingUrl, setOnboardingUrl] = useState("");

  // NEW: transfer funds input
  const [transferAccountId, setTransferAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // ---------------- LOAD DASHBOARD DATA ----------------
  useEffect(() => {
    API.get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => alert("Error loading dashboard stats"));

    loadPlatformBalance();
    loadAccounts();
  }, []);

  // ---------------- PLATFORM BALANCE ----------------
  const loadPlatformBalance = async () => {
    try {
      const res = await API.get("/payout/platform-balance");
      setPlatformBalance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- CONNECTED ACCOUNT BALANCE ----------------
  const getConnectedBalance = async () => {
    if (!accountId) return alert("Enter an account_id");

    try {
      const res = await API.post("/payout/balance", { accountId });
      setConnectedBalance(res.data);
    } catch (err) {
      alert("Invalid account ID");
    }
  };

  // ---------------- LOAD CONNECTED ACCOUNTS ----------------
  const loadAccounts = async () => {
    try {
      const res = await API.get("/payout/all-accounts");
      setAccounts(res.data.data || []);
    } catch (err) {
      console.error("Cannot load accounts", err);
    }
  };

  // ---------------- CREATE NEW CONNECTED ACCOUNT ----------------
  const createNewAccount = async () => {
    const email = prompt("Enter email for new connected account:");

    if (!email) return;

    try {
      const res = await API.post("/payout/create-account", { email });

      setOnboardingUrl(res.data.onboardingUrl);
      alert("Account created!");

      loadAccounts();
    } catch (err) {
      alert("Failed to create account");
    }
  };

  // ---------------- ONBOARD EXISTING ACCOUNT ----------------
  const onboardExistingAccount = async (accId) => {
    try {
      const res = await API.get(`/payout/onboarding-link/${accId}`);
      setOnboardingUrl(res.data.url);
      alert("Onboarding link generated!");
    } catch (err) {
      alert("Unable to generate onboarding link");
    }
  };

  // ---------------- CHECK ACCOUNT STATUS ----------------
  const checkAccountStatus = async (accId) => {
    try {
      await API.get(`/payout/account-status/${accId}`);
      alert("Status updated!");

      loadAccounts();
    } catch (err) {
      alert("Cannot fetch account status");
    }
  };

  // ---------------- TRANSFER FUNDS TO CONNECTED ACCOUNT ----------------
  const transferFunds = async () => {
    if (!transferAccountId || !transferAmount) {
      return alert("Enter account ID & amount");
    }

    try {
      await API.post("/payout/transfer", {
        accountId: transferAccountId,
        amount: Number(transferAmount),
      });

      alert("Funds transferred successfully!");
      setTransferAmount("");
    } catch (err) {
      console.error(err);
      alert("Failed to transfer funds");
    }
  };

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>

      {/* ---------------- CREATE ACCOUNT ---------------- */}
      <div className="create-acc-box">
        <button className="create-btn" onClick={createNewAccount}>
          ➕ Create New Connected Account
        </button>
      </div>

      {/* ---------------- ONBOARDING LINK ---------------- */}
      {onboardingUrl && (
        <div className="onboard-box">
          <p>Onboarding Link:</p>
          <a href={onboardingUrl} target="_blank" rel="noreferrer">
            {onboardingUrl}
          </a>
        </div>
      )}

      {/* ---------------- STATS CARDS ---------------- */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card green">Total Payments: {stats.totalPayments}</div>
          <div className="stat-card red">Failed Payments: {stats.failedPayments}</div>
          <div className="stat-card blue">Total Refunds: {stats.totalRefunds}</div>
          <div className="stat-card yellow">Total Payouts: {stats.totalPayouts}</div>
          <div className="stat-card red">Failed Payouts: {stats.failedPayouts}</div>
        </div>
      )}

      {/* ---------------- PLATFORM BALANCE ---------------- */}
      <h2>Platform Stripe Balance</h2>
      {platformBalance ? (
        <pre className="balance-box">
Available: {platformBalance.available[0]?.amount} {platformBalance.available[0]?.currency}
Pending:   {platformBalance.pending[0]?.amount} {platformBalance.pending[0]?.currency}
        </pre>
      ) : (
        <p>Loading platform balance...</p>
      )}

      {/* ---------------- CONNECTED ACCOUNT BALANCE ---------------- */}
      <h2>Connected Account Balance</h2>
      <input
        type="text"
        placeholder="Enter account_id"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
      />
      <button onClick={getConnectedBalance}>Check Balance</button>

      {connectedBalance && (
        <pre className="balance-box">
Available: {connectedBalance.available[0]?.amount} {connectedBalance.available[0]?.currency}
Pending:   {connectedBalance.pending[0]?.amount} {connectedBalance.pending[0]?.currency}
        </pre>
      )}

      {/* ---------------- TRANSFER FUNDS SECTION ---------------- */}
      <h2>Transfer Funds to Connected Account</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Connected Account ID"
          value={transferAccountId}
          onChange={(e) => setTransferAccountId(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <input
          type="number"
          placeholder="Amount (in cents)"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <button onClick={transferFunds}>
          Transfer
        </button>
      </div>

      {/* ---------------- CONNECTED ACCOUNTS TABLE ---------------- */}
      <h2>All Connected Accounts</h2>
      <table className="accounts-table">
        <thead>
          <tr>
            <th>Account ID</th>
            <th>Email</th>
            <th>Payouts Enabled</th>
            <th>Charges Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id}>
              <td>{acc.id}</td>
              <td>{acc.email || "—"}</td>
              <td>{acc.payouts_enabled ? "🟢 Yes" : "🔴 No"}</td>
              <td>{acc.charges_enabled ? "🟢 Yes" : "🔴 No"}</td>

              <td>
                <button className="small-btn" onClick={() => onboardExistingAccount(acc.id)}>
                  Onboard
                </button>

                <button className="small-btn" onClick={() => checkAccountStatus(acc.id)}>
                  Refresh Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
