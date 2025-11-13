// js/quartos.js

$(document).ready(function () {
  const container = $("#lista-quartos-container");

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
            <a href="#" class="btn btn-primary ${
              quarto.disponivel ? "" : "disabled"
            }">
              Reservar
            </a>
          </div>
        </div>
      </div>
    `;

    container.append(cardHtml);
  });
});