let totalRevenue = 0;
let totalExpense = 0;
document.addEventListener("DOMContentLoaded", function(){

    loadDashboard();

    // 🔥 REAL-TIME UPDATE
    window.addEventListener("recordsUpdated", loadDashboard);

});

// Load existing records on page load
window.onload = function(){
    let records = JSON.parse(localStorage.getItem("records")) || [];
    
    let table = document.getElementById("transactionTable").querySelector("tbody");
    table.innerHTML = "";

    records.forEach((record, index) => addToTable(record, index));
    updateTotals(records);
};


// FORM SUBMIT
document.getElementById("recordForm").addEventListener("submit", function(e){
    e.preventDefault();

    let date = document.getElementById("date").value;
    let type = document.getElementById("type").value;
    let description = document.getElementById("description").value;
    let amount = Number(document.getElementById("amount").value);
    let billFile = document.getElementById("bill").files[0];

    let reader = new FileReader();

    reader.onload = function(){
        let base64 = billFile ? reader.result : null;

        let record = {
            date,
            type,
            description,
            amount,
            bill: base64
        };

        let records = JSON.parse(localStorage.getItem("records")) || [];
        records.push(record);
        localStorage.setItem("records", JSON.stringify(records));

        loadAllRecords();
        document.getElementById("recordForm").reset();
    };

    if(billFile){
        reader.readAsDataURL(billFile);
    } else {
        reader.onload();
    }
});

localStorage.setItem("records", JSON.stringify(records));

// 🔥 Trigger update
window.dispatchEvent(new Event("recordsUpdated"));

loadAllRecords();

// LOAD ALL RECORDS
function loadAllRecords(){
    let records = JSON.parse(localStorage.getItem("records")) || [];

    let table = document.getElementById("transactionTable").querySelector("tbody");
    table.innerHTML = "";

    records.forEach((record, index) => addToTable(record, index));

    updateTotals(records);
}


// ADD TO TABLE (UPDATED ✅)
function addToTable(record, index){

    let table = document.getElementById("transactionTable").querySelector("tbody");
    let row = table.insertRow();

    row.insertCell(0).innerText = record.date;
    row.insertCell(1).innerText = record.type;
    row.insertCell(2).innerText = record.description;
    row.insertCell(3).innerText = "₹" + record.amount;

    // 👉 BILL COLUMN
    let billCell = row.insertCell(4);

    if(record.bill){
        let link = document.createElement("span");
        link.innerText = "View Bill";
        link.style.color = "#ff7a00";
        link.style.cursor = "pointer";
        link.style.textDecoration = "underline";

        link.onclick = function(){

            document.getElementById("billPreview").style.display = "block";
            document.getElementById("previewDate").innerText = record.date;
            document.getElementById("previewType").innerText = record.type;
            document.getElementById("previewDesc").innerText = record.description;
            document.getElementById("previewAmount").innerText = "₹" + record.amount;

            let previewFile = document.getElementById("previewFile");
            previewFile.innerHTML = "";

            if(record.bill.startsWith("data/image")){
                let img = document.createElement("img");
                img.src = record.bill;
                img.style.width = "300px";
                previewFile.appendChild(img);
            } else {
                let a = document.createElement("a");
                a.href = record.bill;
                a.target = "_blank";
                a.innerText = "Open Bill";
                previewFile.appendChild(a);
            }
        };

        billCell.appendChild(link);
    } else {
        billCell.innerText = "—";
    }

    // 👉 DELETE COLUMN (NEW ✅)
    let deleteCell = row.insertCell(5);

    let delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.style.background = "#e63946";
    delBtn.style.color = "#fff";
    delBtn.style.border = "none";
    delBtn.style.padding = "5px 10px";
    delBtn.style.cursor = "pointer";
    delBtn.style.borderRadius = "5px";

    delBtn.onclick = function(){
        deleteRecord(index);
    };

    deleteCell.appendChild(delBtn);
}


// DELETE FUNCTION
function deleteRecord(index){

    let records = JSON.parse(localStorage.getItem("records")) || [];

    if(confirm("Are you sure you want to delete this record?")){
        records.splice(index, 1);
        localStorage.setItem("records", JSON.stringify(records));

        loadAllRecords();
    }
}
localStorage.setItem("records", JSON.stringify(records));

window.dispatchEvent(new Event("recordsUpdated")); // 🔥 important

loadAllRecords();

// UPDATE TOTALS
function updateTotals(records){

    totalRevenue = 0;
    totalExpense = 0;

    records.forEach(r => {
        if(r.type === "Revenue"){
            totalRevenue += r.amount;
        } else {
            totalExpense += r.amount;
        }
    });

    let balance = totalRevenue - totalExpense;

    document.getElementById("revenue").innerText = "₹" + totalRevenue;
    document.getElementById("expense").innerText = "₹" + totalExpense;
    document.getElementById("balance").innerText = "₹" + balance;
}
localStorage.setItem("records", JSON.stringify(records));
window.dispatchEvent(new Event("recordsUpdated")); // 🔥 ADD THIS
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