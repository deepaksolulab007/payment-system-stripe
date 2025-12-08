// import React, { useState } from "react";
// import API from "../../utils/api";
// import AdminLayout from "../../components/AdminLayout";

// export default function Payouts() {
//   const [payouts, setPayouts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [accountId, setAccountId] = useState("");
//   const [amount, setAmount] = useState("");

//   // Load payouts for the entered connected account
//   const loadPayouts = async () => {
//     if (!accountId) {
//       setPayouts([]); // clear old payout list
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await API.get(`/payout/all-payouts/${accountId}`);
//       setPayouts(res.data.data || []);
//     } catch (err) {
//       console.error("Failed to fetch payouts:", err);
//       alert("Error fetching payouts");
//     }

//     setLoading(false);
//   };

//   // Create payout
//   const createPayout = async () => {
//     if (!accountId || !amount) {
//       return alert("Please enter Account ID and Amount");
//     }

//     try {
//       await API.post("/payout/create-payout", {
//         accountId,
//         amount: Number(amount),
//       });

//       alert("Payout created successfully!");
//       loadPayouts();
//     } catch (err) {
//       console.error("Failed to create payout", err);
//       alert("Error creating payout");
//     }
//   };

//   return (
//     <AdminLayout>
//       <h1>Payout Management</h1>

//       {/* CREATE PAYOUT FORM */}
//       <h3>Create New Payout</h3>

//       <div style={{ marginBottom: "20px" }}>
//         <input
//           type="text"
//           placeholder="Connected Account ID"
//           value={accountId}
//           onChange={(e) => setAccountId(e.target.value)}
//           style={{ marginRight: "10px", padding: "6px" }}
//         />

//         <input
//           type="number"
//           placeholder="Amount (in cents)"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           style={{ marginRight: "10px", padding: "6px" }}
//         />

//         <button onClick={createPayout} style={{ padding: "6px 12px" }}>
//           Create Payout
//         </button>

//         {accountId && (
//           <button
//             onClick={loadPayouts}
//             style={{ padding: "6px 12px", marginLeft: "10px" }}
//           >
//             Refresh Payouts
//           </button>
//         )}
//       </div>

//       {/* PAYOUT TABLE */}
//       {!accountId ? (
//         <p>Enter a Connected Account ID to view payouts.</p>
//       ) : loading ? (
//         <p>Loading payouts...</p>
//       ) : payouts.length === 0 ? (
//         <p>No payouts found.</p>
//       ) : (
//         <table
//           border="1"
//           cellPadding="10"
//           style={{ width: "100%", marginTop: "20px" }}
//         >
//           <thead>
//             <tr>
//               <th>Payout ID</th>
//               <th>Amount</th>
//               <th>Currency</th>
//               <th>Status</th>
//               <th>Arrival Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {payouts.map((p) => (
//               <tr key={p.id}>
//                 <td>{p.id}</td>
//                 <td>{p.amount}</td>
//                 <td>{p.currency}</td>
//                 <td>{p.status}</td>
//                 <td>
//                   {p.arrival_date
//                     ? new Date(p.arrival_date * 1000).toLocaleString()
//                     : "—"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </AdminLayout>
//   );
// }



import React, { useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");

  // Weekly schedule state
  const [scheduleDay, setScheduleDay] = useState("monday");

  // Load payouts for a connected account
  const loadPayouts = async () => {
    if (!accountId) {
      setPayouts([]);
      return;
    }

    setLoading(true);

    try {
      const res = await API.get(`/payout/all-payouts/${accountId}`);
      setPayouts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
      alert("Error fetching payouts");
    }

    setLoading(false);
  };

  // Create manual instant payout
  const createPayout = async () => {
    if (!accountId || !amount) {
      return alert("Please enter Account ID and Amount");
    }

    try {
      await API.post("/payout/create-payout", {
        accountId,
        amount: Number(amount),
      });

      alert("Instant payout created successfully!");
      loadPayouts();
    } catch (err) {
      console.error("Failed to create payout", err);
      alert("Error creating payout");
    }
  };

  // Save weekly payout schedule
  const saveSchedule = async () => {
    if (!accountId) return alert("Enter Account ID first!");

    try {
      await API.post("/payout/set-schedule", {
        accountId,
        day: scheduleDay,
      });

      alert(`Weekly payout schedule updated to every ${scheduleDay}!`);
    } catch (err) {
      console.error("Failed to save payout schedule:", err);
      alert("Error saving schedule");
    }
  };

  return (
    <AdminLayout>
      <h1>Payout Management</h1>

      {/* ===========================
          WEEKLY PAYOUT SCHEDULE
      ========================== */}
      <h3>Weekly Payout Schedule</h3>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Connected Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <select
          value={scheduleDay}
          onChange={(e) => setScheduleDay(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        >
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
          <option value="saturday">Saturday</option>
          <option value="sunday">Sunday</option>
        </select>

        <button onClick={saveSchedule} style={{ padding: "6px 12px" }}>
          Save Schedule
        </button>
      </div>

      {/* ===========================
          MANUAL INSTANT PAYOUT
      ========================== */}
      <h3>Create Manual Payout (Instant)</h3>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Amount (in cents)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <button onClick={createPayout} style={{ padding: "6px 12px" }}>
          Create Payout
        </button>

        {accountId && (
          <button
            onClick={loadPayouts}
            style={{ padding: "6px 12px", marginLeft: "10px" }}
          >
            Refresh Payouts
          </button>
        )}
      </div>

      {/* ===========================
          PAYOUT RECORD TABLE
      ========================== */}
      {!accountId ? (
        <p>Enter a Connected Account ID to view payouts.</p>
      ) : loading ? (
        <p>Loading payouts...</p>
      ) : payouts.length === 0 ? (
        <p>No payouts found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", marginTop: "20px" }}
        >
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Arrival Date</th>
            </tr>
          </thead>

          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.amount}</td>
                <td>{p.currency}</td>
                <td>{p.status}</td>
                <td>
                  {p.arrival_date
                    ? new Date(p.arrival_date * 1000).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
