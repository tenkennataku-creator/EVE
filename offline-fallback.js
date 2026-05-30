(() => {
  const GOOGLE_AI_HOST = "generativelanguage.googleapis.com";
  const DEFAULT_LOCAL_ENDPOINT = "http://127.0.0.1:11434/api/chat";
  const DEFAULT_LOCAL_MODEL = "gemma4";
  const originalFetch = window.fetch.bind(window);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/EVE/service-worker.js", { scope: "/EVE/" }).catch(() => {});
    });
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";

    if (!url.includes(GOOGLE_AI_HOST)) {
      return originalFetch(input, init);
    }

    try {
      return await originalFetch(input, init);
    } catch {
      const prompt = extractLastUserPrompt(init.body);
      const localAnswer = await askLocalModel(prompt);
      return geminiResponse(localAnswer || offlineAnswer(prompt));
    }
  };

  function extractLastUserPrompt(body) {
    try {
      const parsed = typeof body === "string" ? JSON.parse(body) : body;
      const contents = parsed?.contents || [];
      for (let i = contents.length - 1; i >= 0; i -= 1) {
        if (contents[i]?.role === "user") {
          return (contents[i].parts || []).map((part) => part.text || "").join(" ").trim();
        }
      }
    } catch {}
    return "";
  }

  async function askLocalModel(prompt) {
    const endpoint = localStorage.getItem("eve_local_model_endpoint") || DEFAULT_LOCAL_ENDPOINT;
    const model = localStorage.getItem("eve_local_model_name") || DEFAULT_LOCAL_MODEL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await originalFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content: "You are EVE, a concise mobile assistant. Reply in one to three short sentences."
            },
            { role: "user", content: prompt || "Say hello." }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) return "";
      const data = await response.json();
      return data?.message?.content || data?.response || data?.choices?.[0]?.message?.content || "";
    } catch {
      return "";
    } finally {
      clearTimeout(timeout);
    }
  }

  function offlineAnswer(prompt) {
    const text = (prompt || "").toLowerCase();

    if (text.includes("reward") || text.includes("points")) {
      return "Offline mode is active. I can give general rewards help, but current balances and offers need an online check.";
    }
    if (text.includes("receipt") || text.includes("payment") || text.includes("charge")) {
      return "Offline mode is active. Save the station, pump number, date, time, amount, and card last four digits so support can look it up later.";
    }
    if (text.includes("station") || text.includes("gas") || text.includes("fuel") || text.includes("map")) {
      return "Offline mode is active. I can help with general station questions, but live fuel prices, directions, and hours need internet.";
    }
    return "Offline mode is active. I can still answer common questions and will use your local model when it is reachable on this phone.";
  }

  function geminiResponse(message) {
    return new Response(JSON.stringify({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({ message, emotion: "IDLE" })
              }
            ]
          }
        }
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
})();
