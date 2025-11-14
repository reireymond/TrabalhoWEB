let modalQuartoBootstrap;

function carregarReservas() {
  const dados = localStorage.getItem("hotelFenixReservas");
  return dados ? JSON.parse(dados) : [];
}

function salvarReservas(reservas) {
  localStorage.setItem("hotelFenixReservas", JSON.stringify(reservas));
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });
}

function atualizarStats() {
  const totalQuartos = bancoDeDadosQuartos.length;
  const disponiveis = bancoDeDadosQuartos.filter((q) => q.disponivel).length;
  const ocupados = totalQuartos - disponiveis;

  $("#stat-total-quartos").text(totalQuartos);
  $("#stat-disponiveis").text(disponiveis);
  $("#stat-ocupados").text(ocupados);
}

function renderizarTabelaQuartos() {
  const tabelaQuartos = $("#tabela-admin-quartos");
  tabelaQuartos.empty();
  bancoDeDadosQuartos.sort((a, b) => a.id - b.id);

  bancoDeDadosQuartos.forEach((quarto) => {
    const precoFormatado = formatarMoeda(quarto.precoPorNoite);
    const statusBadge = quarto.disponivel
      ? '<span class="badge bg-success">Disponível</span>'
      : '<span class="badge bg-danger">Ocupado</span>';

    const linhaQuarto = `
            <tr data-id="${quarto.id}">
                <td>${quarto.id}</td>
                <td>${quarto.nome}</td>
                <td>${quarto.tipoCama}</td>
                <td>${quarto.capacidade} pessoas</td>
                <td>${precoFormatado}</td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <button class="btn btn-primary btn-sm btn-alterar" data-id="${quarto.id}" title="Alterar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-excluir" data-id="${quarto.id}" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    tabelaQuartos.append(linhaQuarto);
  });

  atualizarStats();
}

function renderizarTabelaReservas() {
  const tabelaReservas = $("#tabela-reservas");
  tabelaReservas.empty();
  const reservas = carregarReservas();

  if (reservas.length === 0) {
    tabelaReservas.html(
      '<tr><td colspan="7" class="text-center">Nenhuma reserva encontrada.</td></tr>'
    );
    return;
  }

  reservas.forEach((quarto) => {
    const totalFormatado = quarto.totalPagar
      ? formatarMoeda(quarto.totalPagar)
      : "N/A";
    const diarias = quarto.numDiarias || "N/A";

    const checkinFormatado = quarto.checkin
      ? new Date(quarto.checkin + "T00:00:00").toLocaleDateString("pt-BR")
      : "N/A";
    const checkoutFormatado = quarto.checkout
      ? new Date(quarto.checkout + "T00:00:00").toLocaleDateString("pt-BR")
      : "N/A";

    const linhaReserva = `
            <tr data-id="${quarto.id}">
                <td>${quarto.id}</td>
                <td>${quarto.nome}</td>
                <td>${checkinFormatado}</td>
                <td>${checkoutFormatado}</td>
                <td>${diarias}</td>
                <td>${totalFormatado}</td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm btn-cancelar-reserva" data-id="${quarto.id}" title="Cancelar Reserva">
                        <i class="bi bi-x-lg"></i> Cancelar
                    </button>
                </td>
            </tr>
        `;
    tabelaReservas.append(linhaReserva);
  });
}

function isIdDuplicado(idNovo, idAntigo = null) {
  const idNovoNum = parseInt(idNovo);
  return bancoDeDadosQuartos.some((quarto) => {
    if (idAntigo && quarto.id === parseInt(idAntigo)) {
      return false;
    }
    return quarto.id === idNovoNum;
  });
}

$(document).ready(function () {
  function atualizarMenuAtivo() {
    const paginaAtual = window.location.pathname.split("/").pop();
    const menuLinks = $("#admin-menu .nav-link");
    menuLinks.removeClass("active");
    menuLinks.each(function () {
      const linkHref = $(this).attr("href").split("/").pop();
      if (linkHref === paginaAtual) {
        $(this).addClass("active");
      }
    });
  }

  atualizarMenuAtivo();
  carregarDados();

  if ($("#tabela-admin-quartos").length > 0) {
    modalQuartoBootstrap = new bootstrap.Modal("#modalQuarto");
    renderizarTabelaQuartos();
  }

  if ($("#tabela-reservas").length > 0) {
    renderizarTabelaReservas();
  }

  $("#btnAdicionarQuarto").on("click", function () {
    $("#modalQuartoLabel").text("Adicionar Novo Quarto");
    $("#formQuarto").trigger("reset");
    $("#formQuartoIdAntigo").val("");
    $("#formQuartoId").prop("readonly", false);
    $("#formQuartoId").removeClass("is-invalid");
    $("#formQuartoDisponivel").prop("checked", true);
  });

  $("#tabela-admin-quartos").on("click", ".btn-alterar", function () {
    const quartoId = $(this).data("id");
    const quarto = bancoDeDadosQuartos.find((q) => q.id == quartoId);

    if (quarto) {
      $("#modalQuartoLabel").text("Alterar Quarto");
      $("#formQuartoIdAntigo").val(quarto.id);
      $("#formQuartoId").val(quarto.id);
      $("#formQuartoId").removeClass("is-invalid");
      $("#formQuartoNome").val(quarto.nome);
      $("#formQuartoCamas").val(quarto.tipoCama);
      $("#formQuartoCapacidade").val(quarto.capacidade);
      $("#formQuartoPreco").val(quarto.precoPorNoite);
      $("#formQuartoImagem").val(quarto.imagem);
      $("#formQuartoDisponivel").prop("checked", quarto.disponivel);

      modalQuartoBootstrap.show();
    }
  });

  $("#btnSalvarQuarto").on("click", function () {
    const idAntigo = $("#formQuartoIdAntigo").val();
    const idNovo = $("#formQuartoId").val();
    const nome = $("#formQuartoNome").val();
    const capacidade = parseInt($("#formQuartoCapacidade").val());
    const preco = parseFloat($("#formQuartoPreco").val());

    if (!idNovo) {
      alert("O Número do Quarto (ID) é obrigatório.");
      return;
    }
    if (isIdDuplicado(idNovo, idAntigo)) {
      $("#formQuartoId").addClass("is-invalid");
      alert("Este Número de Quarto (ID) já está em uso.");
      return;
    }
    if (!nome || nome.trim() === "") {
      alert("O Nome do Quarto é obrigatório.");
      return;
    }
    if (isNaN(capacidade) || capacidade < 1) {
      alert("A capacidade deve ser um número igual ou maior que 1.");
      return;
    }
    if (isNaN(preco) || preco < 0) {
      alert("O preço deve ser um número positivo.");
      return;
    }

    $("#formQuartoId").removeClass("is-invalid");

    const dadosQuarto = {
      id: parseInt(idNovo),
      nome: nome,
      tipoCama: $("#formQuartoCamas").val(),
      capacidade: capacidade,
      precoPorNoite: preco,
      imagem: $("#formQuartoImagem").val(),
      disponivel: $("#formQuartoDisponivel").is(":checked"),
    };

    if (idAntigo) {
      const index = bancoDeDadosQuartos.findIndex((q) => q.id == idAntigo);
      if (index !== -1) {
        bancoDeDadosQuartos[index] = dadosQuarto;
      }
    } else {
      bancoDeDadosQuartos.push(dadosQuarto);
    }

    salvarDados();
    modalQuartoBootstrap.hide();
    renderizarTabelaQuartos();
  });

  $("#tabela-admin-quartos").on("click", ".btn-excluir", function () {
    const quartoId = $(this).data("id");
    if (confirm("Tem certeza que deseja excluir o quarto nº " + quartoId + "?")) {
      const index = bancoDeDadosQuartos.findIndex((q) => q.id == quartoId);
      if (index !== -1) {
        bancoDeDadosQuartos.splice(index, 1);
        salvarDados();
        renderizarTabelaQuartos();
      }
    }
  });

  $("#tabela-reservas").on("click", ".btn-cancelar-reserva", function () {
    const quartoId = $(this).data("id");
    if (
      confirm("Tem certeza que deseja cancelar a reserva do quarto nº " + quartoId + "?")
    ) {
      const reservas = carregarReservas();
      const novasReservas = reservas.filter((r) => r.id != quartoId);
      salvarReservas(novasReservas);

      const quartoDB = bancoDeDadosQuartos.find((q) => q.id == quartoId);
      if (quartoDB) {
        quartoDB.disponivel = true;
        salvarDados();
      }

      alert("Reserva cancelada e quarto novamente disponível.");
      renderizarTabelaReservas();
    }
  });
});