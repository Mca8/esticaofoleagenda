const CONFIG = {
    owner: "mca8",
    repo: "esticaofoleagenda",
    branch: "main",
    file: "festas_general.json"
};

const meses = [
    "",
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

let dados = {
    festas: []
};

let festaAtualIndex = null;
let novaFestaAberta = false;


// =====================================================
// TOKEN
// =====================================================

function carregarToken() {

    const token = localStorage.getItem("githubToken");

    if (token) {
        document.getElementById("githubToken").value = token;
    }
}


function guardarToken() {

    const token = document
        .getElementById("githubToken")
        .value
        .trim();

    if (!token) {
        alert("Introduz o token GitHub.");
        return;
    }

    localStorage.setItem("githubToken", token);

    alert("Token guardado.");
}


// =====================================================
// CARREGAR JSON
// =====================================================

async function carregarJSON() {

    const status = document.getElementById("status");

    status.innerHTML = "A carregar agenda...";

    try {

        const response = await fetch(
            `festas_general.json?v=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error("Erro ao carregar o JSON.");
        }

        dados = await response.json();

        if (!Array.isArray(dados.festas)) {
            dados.festas = [];
        }

        dados.festas.forEach(function(festa) {

            if (typeof festa.sound === "undefined") {
                festa.sound = false;
            }

        });

        ordenarFestas();
        renderLista();

        status.innerHTML = "";

    } catch (erro) {

        console.error(erro);

        status.innerHTML =
            "❌ Erro ao carregar agenda.";
    }
}


// =====================================================
// LISTA MINIMALISTA
// =====================================================

function renderLista() {

    const container =
        document.getElementById("listaFestas");

    container.innerHTML = "";

    dados.festas.forEach(function(festa, index) {

        const item = document.createElement("div");

        item.className = "festa-item";

        const nomeMes =
            festa.month === "Marco"
                ? "Março"
                : festa.month;

        let horaTexto = "Hora não definida";

        if (Number(festa.hour) !== 0) {

            const minutos =
                String(festa.min).padStart(2, "0");

            horaTexto =
                `${festa.hour}H${minutos}`;
        }

        item.innerHTML = `
            <div class="festa-info">

                <div class="festa-local">
                    ${escapeHTML(festa.local)}
                </div>

                <div class="festa-data">
                    ${festa.day} ${nomeMes} · ${horaTexto}
                </div>

            </div>

            <div class="festa-edit">
                <i class="fa-solid fa-chevron-right"></i>
            </div>
        `;

        item.addEventListener("click", function() {
            editarFesta(index);
        });

        container.appendChild(item);
    });
}


// =====================================================
// EDITAR
// =====================================================

function editarFesta(index) {

    festaAtualIndex = index;
    novaFestaAberta = false;

    const festa = dados.festas[index];

    document.getElementById("modalTitle").innerText =
        "Editar Festa";

    document.getElementById("editLocal").value =
        festa.local || "";

    document.getElementById("editDay").value =
        festa.day || "";

    document.getElementById("editMonth").value =
        festa.month_number || 1;

    document.getElementById("editHour").value =
        festa.hour ?? 0;

    document.getElementById("editMin").value =
        festa.min ?? 0;

    document.getElementById("editDinner").value =
        festa.dinner ?? 0;

    document.getElementById("editFat").value =
        festa.fat ?? 0;

    document.getElementById("editSound").value =
        festa.sound === true
            ? "true"
            : "false";

    document.getElementById("editValue").value =
        festa.value ?? 0;

    document.getElementById("btnEliminar").style.display =
        "block";

    abrirModal();
}


// =====================================================
// NOVA FESTA
// =====================================================

function novaFesta() {

    festaAtualIndex = null;
    novaFestaAberta = true;

    document.getElementById("modalTitle").innerText =
        "Nova Festa";

    document.getElementById("editLocal").value = "";
    document.getElementById("editDay").value = "";

    document.getElementById("editMonth").value =
        new Date().getMonth() + 1;

    document.getElementById("editHour").value = 0;
    document.getElementById("editMin").value = 0;

    document.getElementById("editDinner").value = 0;
    document.getElementById("editFat").value = 0;

    document.getElementById("editSound").value =
        "false";

    document.getElementById("editValue").value = 0;

    document.getElementById("btnEliminar").style.display =
        "none";

    abrirModal();
}


// =====================================================
// GUARDAR MODAL
// =====================================================

function guardarModal() {

    const local = document
        .getElementById("editLocal")
        .value
        .trim();

    const day = document
        .getElementById("editDay")
        .value;

    const monthNumber = Number(
        document.getElementById("editMonth").value
    );

    if (!local) {
        alert("Indica o local.");
        return;
    }

    if (!day) {
        alert("Indica o dia.");
        return;
    }

    const festa = {

        local: local,

        day: String(day),

        month: meses[monthNumber],

        month_number: monthNumber,

        dinner: Number(
            document.getElementById("editDinner").value
        ),

        hour: Number(
            document.getElementById("editHour").value
        ),

        min: Number(
            document.getElementById("editMin").value
        ),

        fat: Number(
            document.getElementById("editFat").value
        ),

        sound:
            document.getElementById("editSound").value
            === "true",

        value: Number(
            document.getElementById("editValue").value
        )
    };

    if (novaFestaAberta) {

        dados.festas.push(festa);

    } else {

        dados.festas[festaAtualIndex] = festa;
    }

    ordenarFestas();
    renderLista();
    fecharModal();
}


// =====================================================
// ELIMINAR
// =====================================================

function eliminarFestaAtual() {

    if (festaAtualIndex === null) {
        return;
    }

    const festa = dados.festas[festaAtualIndex];

    const confirmar = confirm(
        `Eliminar a festa de ${festa.local}?`
    );

    if (!confirmar) {
        return;
    }

    dados.festas.splice(festaAtualIndex, 1);

    ordenarFestas();
    renderLista();
    fecharModal();
}


// =====================================================
// MODAL
// =====================================================

function abrirModal() {

    document
        .getElementById("modalOverlay")
        .classList
        .add("active");

    document.body.style.overflow = "hidden";
}


function fecharModal() {

    document
        .getElementById("modalOverlay")
        .classList
        .remove("active");

    document.body.style.overflow = "";

    festaAtualIndex = null;
    novaFestaAberta = false;
}


// =====================================================
// ORDENAR
// =====================================================

function ordenarFestas() {

    dados.festas.sort(function(a, b) {

        if (
            Number(a.month_number) !==
            Number(b.month_number)
        ) {

            return (
                Number(a.month_number) -
                Number(b.month_number)
            );
        }

        return Number(a.day) - Number(b.day);
    });
}


// =====================================================
// BASE64
// =====================================================

function paraBase64(texto) {

    const bytes = new TextEncoder().encode(texto);

    let binary = "";

    bytes.forEach(function(byte) {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}


// =====================================================
// GUARDAR NO GITHUB
// =====================================================

async function guardarGitHub() {

    const token = document
        .getElementById("githubToken")
        .value
        .trim();

    const status =
        document.getElementById("status");

    if (!token) {

        alert("Introduz o token GitHub.");

        return;
    }

    status.innerHTML =
        "⏳ A guardar alterações...";

    const apiURL =
        `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`;

    try {

        const atual = await fetch(
            `${apiURL}?ref=${CONFIG.branch}&t=${Date.now()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept:
                        "application/vnd.github+json"
                }
            }
        );

        if (!atual.ok) {

            const erroAtual =
                await atual.json();

            throw new Error(
                erroAtual.message ||
                "Não foi possível obter o ficheiro atual."
            );
        }

        const ficheiroAtual =
            await atual.json();

        ordenarFestas();

        const novoJSON =
            JSON.stringify(
                dados,
                null,
                4
            );

        const response = await fetch(
            apiURL,
            {
                method: "PUT",

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    Accept:
                        "application/vnd.github+json",

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    message:
                        "Atualização da agenda Estica o Fole",

                    content:
                        paraBase64(novoJSON),

                    sha:
                        ficheiroAtual.sha,

                    branch:
                        CONFIG.branch
                })
            }
        );

        if (!response.ok) {

            const erro =
                await response.json();

            throw new Error(
                erro.message ||
                "Erro ao guardar."
            );
        }

        status.innerHTML =
            "✅ Agenda guardada com sucesso!";

        setTimeout(function() {
            status.innerHTML = "";
        }, 4000);

    } catch (erro) {

        console.error(erro);

        status.innerHTML =
            "❌ " + erro.message;
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto || "";

    return div.innerHTML;
}


// =====================================================
// FECHAR MODAL AO CLICAR FORA
// =====================================================

document
    .getElementById("modalOverlay")
    .addEventListener("click", function(event) {

        if (event.target === this) {
            fecharModal();
        }

    });


// =====================================================
// INICIAR
// =====================================================

carregarToken();
carregarJSON();
