document.addEventListener("DOMContentLoaded", function () {

    let records = JSON.parse(localStorage.getItem("records")) || [];

    let totalRevenue = 0;
    let totalExpense = 0;
    let categories = {};

    // ✅ CALCULATE VALUES
    records.forEach(r => {
        if (r.type === "Revenue") {
            totalRevenue += r.amount;
        } else {
            totalExpense += r.amount;

            // for pie chart
            if (!categories[r.description]) {
                categories[r.description] = 0;
            }
            categories[r.description] += r.amount;
        }
    });

    let profit = totalRevenue - totalExpense;

    // ✅ UPDATE UI
    document.getElementById("totalRevenue").innerText = "₹ " + totalRevenue;
    document.getElementById("totalExpense").innerText = "₹ " + totalExpense;
    document.getElementById("netProfit").innerText = "₹ " + profit;


    // 🔥 LINE CHART
    const ctx = document.getElementById("lineChart").getContext("2d");

    const gradientLine = ctx.createLinearGradient(0, 0, 0, 300);
    gradientLine.addColorStop(0, "#14213d");
    gradientLine.addColorStop(1, "#3a5a9b");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Revenue", "Expense"],
            datasets: [{
                label: "Finance Overview",
                data: [totalRevenue, totalExpense],
                borderColor: "#14213d",
                backgroundColor: gradientLine,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });


    // 🔥 PIE CHART
    const pieCtx = document.getElementById("pieChart");

    new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    "#203b74",
                    "#3b4756",
                    "#647ba1",
                    "#5c7cfa",
                    "#14213d"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

});
 /* ================= CHATBOT ================= */

        function toggleChatbot() {
            document.getElementById("chatbot").classList.toggle("chatbot-hidden");
        }

        function saveChats() {
            localStorage.setItem("startsmart_chat", document.getElementById("chat-box").innerHTML);
        }

        function loadChats() {
            const saved = localStorage.getItem("startsmart_chat");
            const chatBox = document.getElementById("chat-box");

            if (!chatBox) return;

            chatBox.innerHTML = saved ||
                `<div class="bot-message">Hello! Ask me about startup ideas, finance, or business planning.</div>`;

            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function clearChats() {
            localStorage.removeItem("startsmart_chat");
            loadChats();
        }

        async function sendMessage() {
            const inputEl = document.getElementById("userInput");
            const chatBox = document.getElementById("chat-box");

            if (!inputEl || !chatBox) return;

            const input = inputEl.value.trim();
            if (!input) return;

            // User message
            const userMsg = document.createElement("div");
            userMsg.className = "user-message";
            userMsg.innerText = input;
            chatBox.appendChild(userMsg);

            inputEl.value = "";

            // Loading message
            const loading = document.createElement("div");
            loading.className = "bot-message";
            loading.innerText = "Typing...";
            chatBox.appendChild(loading);

            chatBox.scrollTop = chatBox.scrollHeight;
            saveChats();

            try {
                const res = await fetch("http://localhost:5000/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: input })
                });

                if (!res.ok) throw new Error("Server response failed");

                const data = await res.json();
                loading.innerText = data.reply || "No response from AI.";

            } catch (err) {
                loading.innerText = "⚠️ Server error. Check backend.";
                console.error(err);
            }

            chatBox.scrollTop = chatBox.scrollHeight;
            saveChats();
        }