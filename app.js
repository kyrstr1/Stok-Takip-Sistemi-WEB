let items = JSON.parse(localStorage.getItem("stok")) || [];

const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("search");
const formBox = document.getElementById("formBox");

let editId = null;

addBtn.onclick = addItem;
saveBtn.onclick = updateItem;
cancelBtn.onclick = cancelEdit;
searchInput.addEventListener("input", render);


document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (editId) {
            updateItem();
        } else {
            addItem();
        }
    }
});

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.innerText = message;
    toast.className = "show " + type;

    setTimeout(() => {
        toast.className = "";
    }, 2500);
}


function save() {
    localStorage.setItem("stok", JSON.stringify(items));
}

function addItem() {
    const name = document.getElementById("name").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const min = Number(document.getElementById("min").value);

    if (!name || quantity < 0 || min < 0) {
        showToast("Lütfen boşlukları düzgün doldurunuz", "error");
        return;
    }

    items.push({
        id: Date.now(),
        name,
        quantity,
        min
    });

    save();
    clearInputs();
    render();

    showToast("Malzeme eklendi ✔");
}

function editItem(id) {
    const item = items.find(i => i.id === id);

    document.getElementById("name").value = item.name;
    document.getElementById("quantity").value = item.quantity;
    document.getElementById("min").value = item.min;

    editId = id;

    addBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";

    formBox.classList.add("edit-mode");

    render();
}

function updateItem() {
    const name = document.getElementById("name").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const min = Number(document.getElementById("min").value);

    if (!name || quantity < 0 || min < 0) {
        showToast("Lütfen boşlukları düzgün doldurunuz", "error");
        return;
    }

    items = items.map(item =>
        item.id === editId ? { ...item, name, quantity, min } : item
    );

    save();
    cancelEdit();
    render();

    showToast("Güncellendi ✔");
}


function cancelEdit() {
    editId = null;

    addBtn.style.display = "inline-block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";

    formBox.classList.remove("edit-mode");

    clearInputs();
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    save();
    render();

    showToast("Silindi ✔", "warning");
}

function clearInputs() {
    document.getElementById("name").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("min").value = "";
}

function render() {
    const search = searchInput.value.toLowerCase();
    tableBody.innerHTML = "";

    items
        .filter(item => item.name.toLowerCase().includes(search))
        .forEach(item => {

            const status = item.quantity <= item.min
                ? `<span class="low">⚠</span>`
                : `<span class="good">✔</span>`;

            const row = document.createElement("tr");

            if (item.id === editId) {
                row.classList.add("editing");
            }

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.min}</td>
                <td>${status}</td>
                <td>
                    <button onclick="editItem(${item.id})">Düzenle</button>
                    <button class="delete" onclick="deleteItem(${item.id})">Sil</button>
                </td>
            `;

            tableBody.appendChild(row);
        });
}

function exportCSV() {
    let csv = "Malzeme,Adet,Min\n";

    items.forEach(item => {
        csv += `${item.name},${item.quantity},${item.min}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "stok.csv";
    a.click();
}

render();
