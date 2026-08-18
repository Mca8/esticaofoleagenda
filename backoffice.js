const CONFIG = {
    owner: "mca8",
    repo: "esticaofoleagenda",
    branch: "main",
    file: "festas_general.json"
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
        alert("Introduz o token GitHub.");
        return;
    }

    localStorage.setItem("githubToken", token);

    alert("Token guardado neste dispositivo.");
}


// =====================================================
// UTF-8 -> BASE64
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
// LIMPAR FORMULÁRIO
// =====================================================

function limparFormulario() {

    document.getElementById("local").value = "";
    document.getElementById("day").value = "";

    document.getElementById("month").value = "1";

    document.getElementById("hour").value = "0";
    document.getElementById("min").value = "0";

    document.getElementById("dinner").value = "0";
    document.getElementById("fat").value = "0";
    document.getElementById("sound").value = "false";

    document.getElementById("value").value = "0";
}


// =====================================================
// VALIDAR FORMULÁRIO
// =====================================================

function validarFormulario() {

    const local = document
        .getElementById("local")
        .value
        .trim();

    const day = Number(
        document.getElementById("day").value
    );

    const month = Number(
        document.getElementById("month").value
    );

    const hour = Number(
        document.getElementById("hour").value
    );

    const min = Number(
        document.getElementById("min").value
    );


    if (!local) {

        alert("Indica o local da festa.");

        document.getElementById("local").focus();

        return false;
    }


    if (!day || day < 1 || day > 31) {

        alert("Indica um dia válido.");

        document.getElementById("day").focus();

        return false;
    }


    if (month < 1 || month > 12) {

        alert("Indica um mês válido.");

        return false;
    }


    if (hour < 0 || hour > 23) {

        alert("Indica uma hora válida.");

        return false;
    }


    if (min < 0 || min > 59) {

        alert("Indica minutos válidos.");

        return false;
    }


    return true;
}


// =====================================================
// CRIAR OBJETO DA NOVA FESTA
// =====================================================

function obterNovaFesta() {

    const monthNumber = Number(
        document.getElementById("month").value
    );

    return {

        local:
            document
                .getElementById("local")
                .value
                .trim(),

        day:
            document
                .getElementById("day")
                .value,

        month:
            meses[monthNumber],

        month_number:
            monthNumber,

        dinner:
            Number(
                document
                    .getElementById("dinner")
                    .value
            ),

        hour:
            Number(
                document
                    .getElementById("hour")
                    .value
            ),

        min:
            Number(
                document
                    .getElementById("min")
                    .value
            ),

        fat:
            Number(
                document
                    .getElementById("fat")
                    .value
            ),

        sound:
            document
                .getElementById("sound")
                .value === "true",

        value:
            Number(
                document
                    .getElementById("value")
                    .value
            )

    };
}


// =====================================================
// ADICIONAR FESTA AO GITHUB
// =====================================================

async function adicionarFestaGitHub() {

    const status =
        document.getElementById("status");

    const token =
        document
            .getElementById("githubToken")
            .value
            .trim();


    // TOKEN

    if (!token) {

        alert("Primeiro tens de colocar o token GitHub.");

        document
            .getElementById("githubToken")
            .focus();

        return;
    }


    // VALIDAR FORM

    if (!validarFormulario()) {
        return;
    }


    const novaFesta = obterNovaFesta();


    const confirmar = confirm(
        "Adicionar esta festa à agenda?\n\n" +
        novaFesta.day + " - " +
        (novaFesta.month === "Marco"
            ? "Março"
            : novaFesta.month) +
        "\n" +
        novaFesta.local
    );


    if (!confirmar) {
        return;
    }


    status.innerHTML =
        "⏳ A adicionar festa...";


    const apiURL =
        `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`;


    try {


        // =================================================
        // 1. OBTER JSON ATUAL DO GITHUB
        // =================================================

        const atual = await fetch(

            `${apiURL}?ref=${CONFIG.branch}&t=${Date.now()}`,

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

            const erroAtual = await atual.json();

            throw new Error(
                erroAtual.message ||
                "Não foi possível obter o ficheiro atual."
            );

        }


        const ficheiroAtual =
            await atual.json();


        // =================================================
        // 2. DESCODIFICAR CONTEÚDO ATUAL
        // =================================================

        const conteudoBase64 =
            ficheiroAtual.content.replace(/\n/g, "");


        const binary =
            atob(conteudoBase64);


        const bytes =
            Uint8Array.from(
                binary,
                char => char.charCodeAt(0)
            );


        const texto =
            new TextDecoder().decode(bytes);


        const dados =
            JSON.parse(texto);


        // =================================================
        // 3. GARANTIR QUE EXISTE O ARRAY FESTAS
        // =================================================

        if (!Array.isArray(dados.festas)) {

            dados.festas = [];

        }


        // =================================================
        // 4. ADICIONAR NOVA FESTA
        // =================================================

        dados.festas.push(novaFesta);


        // =================================================
        // 5. ORDENAR POR MÊS E DIA
        // =================================================

        dados.festas.sort(function(a, b) {

            if (a.month_number !== b.month_number) {

                return a.month_number - b.month_number;

            }

            return Number(a.day) - Number(b.day);

        });


        // =================================================
        // 6. GERAR NOVO JSON
        // =================================================

        const novoJSON =
            JSON.stringify(
                dados,
                null,
                4
            );


        // =================================================
        // 7. GUARDAR NO GITHUB
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
                        "Adicionar festa: " +
                        novaFesta.local,

                    content:
                        paraBase64(novoJSON),

                    sha:
                        ficheiroAtual.sha,

                    branch:
                        CONFIG.branch

                })

            }

        );


        // =================================================
        // 8. VERIFICAR RESPOSTA
        // =================================================

        if (!response.ok) {

            const erro =
                await response.json();

            throw new Error(
                erro.message ||
                "Não foi possível atualizar o ficheiro."
            );

        }


        // =================================================
        // SUCESSO
        // =================================================

        status.innerHTML =
            "✅ Festa adicionada com sucesso!";


        limparFormulario();


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
// INICIAR
// =====================================================

carregarToken();
