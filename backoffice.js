const CONFIG = {
    owner: "mca8",
    repo: "esticaofoleagenda",
    branch: "main",
    file: "festas_general.json"
};

let dados = {
    festas: []
};


// =====================================================
// MESES
// =====================================================

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


// =====================================================
// TOKEN GITHUB
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
        alert("Introduz o token.");
        return;
    }

    localStorage.setItem("githubToken", token);

    alert("Token guardado neste dispositivo.");
}


// =====================================================
// CARREGAR JSON
// =====================================================

async function carregarJSON() {

    try {

        const response = await fetch(
            `festas_general.json?v=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error("Erro ao carregar festas_general.json");
        }

        dados = await response.json();

        // Para festas antigas que ainda não tenham "sound"
        dados.festas.forEach(function(festa) {

            if (typeof festa.sound === "undefined") {
                festa.sound = false;
            }

        });

        renderFestas();

    } catch (erro) {

        console.error(erro);

        document.getElementById("status").innerHTML =
            "❌ Erro ao carregar agenda.";

    }

}


// =====================================================
// MOSTRAR FESTAS
// =====================================================

function renderFestas() {

    const container = document.getElementById("festas");

    container.innerHTML = "";

    dados.festas.forEach((festa, index) => {

        const div = document.createElement("div");

        div.className = "festa";

        div.innerHTML = `

            <h3>Festa ${index + 1}</h3>


            <!-- LOCAL -->

            <label>Local</label>

            <input
                type="text"
                value="${festa.local || ""}"
                onchange="alterar(${index}, 'local', this.value)"
            >


            <!-- DATA -->

            <div class="row">

                <div>

                    <label>Dia</label>

                    <input
                        type="number"
                        min="1"
                        max="31"
                        value="${festa.day || ""}"
                        onchange="alterar(${index}, 'day', this.value)"
                    >

                </div>


                <div>

                    <label>Mês</label>

                    <select
                        onchange="alterarMes(${index}, this.value)"
                    >

                        ${mesesHTML(festa.month_number)}

                    </select>

                </div>

            </div>


            <!-- HORA -->

            <div class="row">

                <div>

                    <label>Hora</label>

                    <input
                        type="number"
                        min="0"
                        max="23"
                        value="${festa.hour ?? 0}"
                        onchange="alterarNumero(${index}, 'hour', this.value)"
                    >

                </div>


                <div>

                    <label>Minutos</label>

                    <input
                        type="number"
                        min="0"
                        max="59"
                        value="${festa.min ?? 0}"
                        onchange="alterarNumero(${index}, 'min', this.value)"
                    >

                </div>

            </div>


            <!-- JANTAR / FAT -->

            <div class="row">

                <div>

                    <label>Jantar</label>

                    <select
                        onchange="alterarNumero(${index}, 'dinner', this.value)"
                    >

                        <option
                            value="0"
                            ${festa.dinner == 0 ? "selected" : ""}
                        >
                            Não
                        </option>

                        <option
                            value="1"
                            ${festa.dinner == 1 ? "selected" : ""}
                        >
                            Sim
                        </option>

                    </select>

                </div>


                <div>

                    <label>FAT</label>

                    <select
                        onchange="alterarNumero(${index}, 'fat', this.value)"
                    >

                        <option
                            value="0"
                            ${festa.fat == 0 ? "selected" : ""}
                        >
                            Não
                        </option>

                        <option
                            value="1"
                            ${festa.fat == 1 ? "selected" : ""}
                        >
                            Sim
                        </option>

                    </select>

                </div>

            </div>


            <!-- SOM -->

            <label>Som</label>

            <select
                onchange="alterarBoolean(${index}, 'sound', this.value)"
            >

                <option
                    value="true"
                    ${festa.sound === true ? "selected" : ""}
                >
                    🔊 Com som
                </option>

                <option
                    value="false"
                    ${festa.sound === false ? "selected" : ""}
                >
                    🔇 Sem som
                </option>

            </select>


            <!-- VALOR -->

            <label>Valor €</label>

            <input
                type="number"
                min="0"
                value="${festa.value ?? 0}"
                onchange="alterarNumero(${index}, 'value', this.value)"
            >


            <!-- ELIMINAR -->

            <button
                class="delete"
                onclick="eliminarFesta(${index})"
            >
                Eliminar
            </button>

        `;

        container.appendChild(div);

    });

}


// =====================================================
// GERAR SELECT DOS MESES
// =====================================================

function mesesHTML(selected) {

    let html = "";

    for (let i = 1; i <= 12; i++) {

        let nomeVisual = meses[i];

        // No JSON fica "Marco"
        // No backoffice aparece "Março"

        if (nomeVisual === "Marco") {
            nomeVisual = "Março";
        }

        html += `

            <option
                value="${i}"
                ${i == selected ? "selected" : ""}
            >
                ${nomeVisual}
            </option>

        `;

    }

    return html;

}


// =====================================================
// ALTERAR TEXTO
// =====================================================

function alterar(index, campo, valor) {

    dados.festas[index][campo] = valor;

}


// =====================================================
// ALTERAR NÚMERO
// =====================================================

function alterarNumero(index, campo, valor) {

    dados.festas[index][campo] = Number(valor);

}


// =====================================================
// ALTERAR BOOLEAN
// =====================================================

function alterarBoolean(index, campo, valor) {

    dados.festas[index][campo] = valor === "true";

}


// =====================================================
// ALTERAR MÊS
// =====================================================

function alterarMes(index, numero) {

    numero = Number(numero);

    dados.festas[index].month_number = numero;

    dados.festas[index].month = meses[numero];

}


// =====================================================
// ADICIONAR NOVA FESTA
// =====================================================

function adicionarFesta() {

    dados.festas.push({

        local: "",

        day: "",

        month: "Janeiro",

        month_number: 1,

        dinner: 0,

        hour: 0,

        min: 0,

        fat: 0,

        sound: false,

        value: 0

    });

    renderFestas();

    // Faz scroll para a nova festa

    setTimeout(function() {

        const festas =
            document.querySelectorAll(".festa");

        if (festas.length > 0) {

            festas[festas.length - 1]
                .scrollIntoView({
                    behavior: "smooth"
                });

        }

    }, 100);

}


// =====================================================
// ELIMINAR FESTA
// =====================================================

function eliminarFesta(index) {

    const confirmar =
        confirm(
            "Tens a certeza que queres eliminar esta festa?"
        );

    if (!confirmar) {
        return;
    }

    dados.festas.splice(index, 1);

    renderFestas();

}


// =====================================================
// UTF-8 -> BASE64
// =====================================================

function paraBase64(texto) {

    const bytes =
        new TextEncoder().encode(texto);

    let binary = "";

    bytes.forEach(function(byte) {

        binary +=
            String.fromCharCode(byte);

    });

    return btoa(binary);

}


// =====================================================
// GUARDAR NO GITHUB
// =====================================================

async function guardarGitHub() {

    const status =
        document.getElementById("status");

    const token =
        document
            .getElementById("githubToken")
            .value
            .trim();


    // Verificar token

    if (!token) {

        alert(
            "Primeiro tens de colocar o token GitHub."
        );

        return;

    }


    status.innerHTML =
        "⏳ A guardar alterações...";


    const apiURL =
        `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`;


    try {


        // =================================================
        // 1. OBTER O FICHEIRO ATUAL
        // =================================================

        const atual = await fetch(

            `${apiURL}?ref=${CONFIG.branch}`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`,

                    Accept:
                        "application/vnd.github+json"

                }

            }

        );


        if (!atual.ok) {

            throw new Error(
                "Não foi possível obter o ficheiro atual."
            );

        }


        const ficheiroAtual =
            await atual.json();


        // =================================================
        // 2. CRIAR NOVO JSON
        // =================================================

        const json =
            JSON.stringify(
                dados,
                null,
                4
            );


        // =================================================
        // 3. CONVERTER PARA BASE64
        // =================================================

        const conteudoBase64 =
            paraBase64(json);


        // =================================================
        // 4. SUBSTITUIR FICHEIRO NO GITHUB
        // =================================================

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
                        conteudoBase64,

                    sha:
                        ficheiroAtual.sha,

                    branch:
                        CONFIG.branch

                })

            }

        );


        // =================================================
        // 5. VERIFICAR RESPOSTA
        // =================================================

        if (!response.ok) {

            const erro =
                await response.json();

            throw new Error(
                erro.message ||
                "Erro ao atualizar ficheiro."
            );

        }


        // =================================================
        // SUCESSO
        // =================================================

        status.innerHTML =
            "✅ Agenda atualizada com sucesso!";


        setTimeout(function() {

            status.innerHTML = "";

        }, 5000);


    } catch (erro) {


        console.error(erro);


        status.innerHTML =
            "❌ Erro: " + erro.message;


    }

}


// =====================================================
// INICIAR BACKOFFICE
// =====================================================

carregarToken();

carregarJSON();