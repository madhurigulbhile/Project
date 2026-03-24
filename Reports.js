function showSection(){

let value=document.getElementById("timeSelector").value

document.getElementById("weekly").style.display="none"
document.getElementById("monthly").style.display="none"
document.getElementById("yearly").style.display="none"

document.getElementById(value).style.display="block"

}

showSection()



new Chart(document.getElementById("weeklyPie"),{
type:"pie",
data:{
labels:["Revenue","Expense","Profit","Loss"],
datasets:[{
data:[3300,1750,1550,50],
backgroundColor:["#ff7a00","#14213d","#ffa94d","#8d99ae"]
}]
}
})


new Chart(document.getElementById("monthlyBar"),{
type:"bar",
data:{
labels:["Jan","Feb","Mar","Apr"],
datasets:[

{
label:"Revenue",
data:[4000,4500,5200,4800],
backgroundColor:"#ff7a00"
},

{
label:"Expense",
data:[2500,2700,3000,2600],
backgroundColor:"#14213d"
}

]
}
})


new Chart(document.getElementById("yearlyPie"),{
type:"pie",
data:{
labels:["2022","2023","2024"],
datasets:[{
data:[45000,52000,61000],
backgroundColor:["#ff7a00","#14213d","#ffa94d"]
}]
}
})
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