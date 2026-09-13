import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

const logIntake = async (req, res) => {
  try {
    const { userId, amount_ml } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/hydration/log`, {
      user_id: userId,
      amount_ml,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

const getTodayLogs = async (req, res) => {
  try {
    const { userId } = req.body;
    const response = await axios.get(`${AI_SERVICE_URL}/api/hydration/logs/today`, {
      params: { user_id: userId },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

const getMonthlyLogs = async (req, res) => {
  try {
    const { userId } = req.body;
    const response = await axios.get(`${AI_SERVICE_URL}/api/hydration/logs/monthly`, {
      params: { user_id: userId },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { userId, daily_goal_ml } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/hydration/feedback`, {
      user_id: userId,
      daily_goal_ml,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

export { logIntake, getTodayLogs, getMonthlyLogs, getFeedback };