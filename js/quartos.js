let modalReservaBootstrap = null;

function renderizarListaQuartos() {
  const container = $("#lista-quartos-container");
  container.empty();

  if (bancoDeDadosQuartos.length === 0) {
    container.html(
      '<p class="text-center col-12">Nenhum quarto encontrado.</p>'
    );
    return;
  }

  bancoDeDadosQuartos.forEach((quarto) => {
    const precoFormatado = quarto.precoPorNoite.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });

    const badgeDisponibilidade = quarto.disponivel
      ? '<span class="badge bg-success">Disponível</span>'
      : '<span class="badge bg-danger">Ocupado</span>';

    const cardHtml = `
      <div class="col">
        <div class="card h-100">
          <img src="${quarto.imagem}" class="card-img-top" alt="${quarto.nome}">
          <div class="card-body">
            <h5 class="card-title">${quarto.nome}</h5>
            <p class="card-text mb-2">
              <i class="bi bi-people"></i> ${quarto.capacidade} Pessoas
            </p>
            <p class="card-text">
              <i class="bi bi-bed"></i> ${quarto.tipoCama}
            </p>
          </div>
          <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
            <div>
              <span class="fs-5 fw-bold text-primary">${precoFormatado}</span>
              <div class="mt-1">${badgeDisponibilidade}</div>
            </div>
            
            <button 
               class="btn btn-primary btn-reservar ${
                 quarto.disponivel ? "" : "disabled"
               }"
               data-id="${quarto.id}"
               data-bs-toggle="modal"
               data-bs-target="#modalReserva">
              Reservar
            </button>

          </div>
        </div>
      </div>
    `;

    container.append(cardHtml);
  });
}

function carregarReservas() {
  const dados = localStorage.getItem("hotelFenixReservas");
  return dados ? JSON.parse(dados) : [];
}

function salvarReservas(reservas) {
  localStorage.setItem("hotelFenixReservas", JSON.stringify(reservas));
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularTotalReserva() {
  const checkinStr = $("#checkin-date").val();
  const checkoutStr = $("#checkout-date").val();
  const precoPorNoite = $("#modalReserva").data("preco-noite");
  const containerCalculo = $("#calculo-reserva");

  if (!checkinStr || !checkoutStr || !precoPorNoite) {
    containerCalculo.addClass("d-none");
    return { diarias: 0, total: 0, valido: false };
  }

  const checkin = new Date(checkinStr + "T00:00:00");
  const checkout = new Date(checkoutStr + "T00:00:00");

  if (checkout <= checkin) {
    containerCalculo.addClass("d-none");
    return { diarias: 0, total: 0, valido: false };
  }

  const diffTime = Math.abs(checkout - checkin);
  const diarias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const total = diarias * precoPorNoite;

  $("#total-diarias").text(diarias);
  $("#valor-total").text(formatarMoeda(total));
  containerCalculo.removeClass("d-none");

  return { diarias: diarias, total: total, valido: true };
}

$(document).ready(function () {
  carregarDados();
  renderizarListaQuartos();

  modalReservaBootstrap = new bootstrap.Modal("#modalReserva");
  const modalReservaElement = document.getElementById("modalReserva");

  modalReservaElement.addEventListener("show.bs.modal", function (event) {
    const button = $(event.relatedTarget);
    const quartoId = button.data("id");
    const quarto = bancoDeDadosQuartos.find((q) => q.id == quartoId);

    $("#modalReservaLabel").text(`Reservar: ${quarto.nome}`);
    $("#btn-confirmar-reserva").data("id", quartoId);
    $("#modalReserva").data("preco-noite", quarto.precoPorNoite);

    const today = getTodayString();
    $("#checkin-date").val(today).attr("min", today);
    $("#checkout-date").val("").attr("min", today);
    $("#calculo-reserva").addClass("d-none");
  });

  $("#checkin-date, #checkout-date").on("change", function () {
    if ($("#checkin-date").val()) {
      $("#checkout-date").attr("min", $("#checkin-date").val());
    }
    calcularTotalReserva();
  });

  $("#btn-confirmar-reserva").on("click", function () {
    const quartoId = $(this).data("id");
    const quarto = bancoDeDadosQuartos.find((q) => q.id == quartoId);
    const calculo = calcularTotalReserva();

    if (!calculo.valido) {
      alert(
        "Datas inválidas. A data de Check-out deve ser posterior ao Check-in."
      );
      return;
    }

    if (quarto) {
      quarto.disponivel = false;
      salvarDados();

      const reservas = carregarReservas();
      quarto.checkin = $("#checkin-date").val();
      quarto.checkout = $("#checkout-date").val();
      quarto.numDiarias = calculo.diarias;
      quarto.totalPagar = calculo.total;
      reservas.push(quarto);
      salvarReservas(reservas);

      modalReservaBootstrap.hide();
      alert(
        `Reserva confirmada! Total de ${calculo.diarias} diárias: ${formatarMoeda(
          calculo.total
        )}`
      );
      renderizarListaQuartos();
    }
  });
});