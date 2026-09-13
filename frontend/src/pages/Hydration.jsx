import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const Hydration = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [amount, setAmount] = useState(250);
  const [todayLogs, setTodayLogs] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchTodayLogs = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/hydration/logs/today", {
        headers: { token },
      });
      setTodayLogs(data);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchMonthlyLogs = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/hydration/logs/monthly", {
        headers: { token },
      });
      setMonthlyData(data);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const logIntake = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/hydration/log",
        { amount_ml: Number(amount) },
        { headers: { token } }
      );
      if (data.id) {
        toast.success(`Logged ${amount}ml`);
        fetchTodayLogs();
        fetchMonthlyLogs();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/hydration/feedback",
        { daily_goal_ml: Number(dailyGoal) },
        { headers: { token } }
      );
      setFeedback(data);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodayLogs();
      fetchMonthlyLogs();
    }
  }, [token]);

  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const maxMonthly = Math.max(...monthlyData.map((d) => d.total_ml), 1);

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">💧 Hydration Tracker</h1>

      {/* Log intake */}
      <div className="bg-white border rounded-lg p-5 mb-6 shadow-sm">
        <p className="font-medium mb-3">Log water intake</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-32"
            min={50}
            step={50}
          />
          <span className="text-gray-500">ml</span>
          <button
            onClick={logIntake}
            className="bg-primary text-white px-5 py-2 rounded hover:opacity-90"
          >
            Log it
          </button>
        </div>
      </div>

      {/* Today's log */}
      <div className="bg-white border rounded-lg p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <p className="font-medium">Today's log</p>
          <p className="text-sm text-gray-500">Total: {todayTotal}ml</p>
        </div>
        {todayLogs.length === 0 ? (
          <p className="text-gray-400 text-sm">No entries yet today.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Time</th>
                <th className="py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {todayLogs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="py-2">
                    {new Date(log.logged_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2">{log.amount_ml}ml</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly chart */}
      <div className="bg-white border rounded-lg p-5 mb-6 shadow-sm">
        <p className="font-medium mb-4">Last 30 days</p>
        {monthlyData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {monthlyData.map((d) => (
              <div key={d.log_date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full bg-primary/70 rounded-t hover:bg-primary transition-all"
                  style={{ height: `${(d.total_ml / maxMonthly) * 100}%` }}
                />
                <span className="absolute -top-6 text-xs opacity-0 group-hover:opacity-100 bg-gray-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                  {d.log_date}: {d.total_ml}ml
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Feedback */}
      <div className="bg-white border rounded-lg p-5 shadow-sm">
        <p className="font-medium mb-3">🤖 Smart feedback</p>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-500">Daily goal:</label>
          <input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            className="border rounded px-2 py-1 w-24 text-sm"
          />
          <span className="text-sm text-gray-500">ml</span>
        </div>
        <button
          onClick={getFeedback}
          disabled={feedbackLoading}
          className="bg-primary text-white px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {feedbackLoading ? "Thinking..." : "Get feedback"}
        </button>
        {feedback && (
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded p-3 text-sm">
            <p>{feedback.feedback}</p>
            <p className="text-gray-500 mt-2">
              {feedback.today_total_ml}ml / {feedback.goal_ml}ml ({feedback.percent_of_goal}% of goal)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hydration;