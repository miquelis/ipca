function BuscarDados() {
  return new Promise(function (resolve, reject) {
    const settings = {
      async: true,
      crossDomain: true,
      url: "https://apisidra.ibge.gov.br/values/t/1737/n1/1/v/63/p/202012-202212/d/2?formato=json",
      method: "GET",
    };

    $.ajax(settings).done(function (response) {
      resolve(response.slice(1));
    });
  });
}

function formatarData(ano, mes) {
  const dataIPCA = new Date(ano, mes);

  if (dataIPCA.getFullYear() == 2020) {
    dataIPCA.setFullYear(2021);
    dataIPCA.setMonth(2);

    mes = dataIPCA.getMonth();
    ano = dataIPCA.getFullYear();
  } else {
    mes = dataIPCA.getMonth() + 3;
    ano = dataIPCA.getFullYear();
  }

  if (ano == 2021 && mes >= 13) {
    dataIPCA.setFullYear(2022);
    dataIPCA.setMonth(mes - 12);

    mes = dataIPCA.getMonth();
    ano = dataIPCA.getFullYear();
  }

  return { ano, mes };
}

async function calcular() {
  const dadosIpca = await BuscarDados();

  const conteudo = [];

  for (let index = 0; index < dadosIpca.length; index++) {
    const element = dadosIpca[index];

    const anoIBGE = parseInt(element["D3N"].split(" ")[1]);
    const mesIBGE = parseInt(element["D3C"].replace(anoIBGE, "")) - 1;

    const { ano, mes } = formatarData(anoIBGE, mesIBGE);

    const ipca = element["V"];
    const saldoDoMes = saldoDevedor(mes, ano);
    const atualizacaoMonetaria = saldoDoMes * (ipca / 100);
    const juros = ((saldoDoMes + atualizacaoMonetaria) * 4.3617) / 1200;
    const seguro = 23.23;
    const taxaAdmnistrativa = 25.0;
    const taxaDeObra =
      atualizacaoMonetaria + juros + seguro + taxaAdmnistrativa;

    const result = {
      ano: ano,
      mes: mes,
      parcela: index + 1,
      data: new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
      }),

      saldoDevedor: saldoDoMes.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      ipca: ipca.replace(".", ",") + "%",
      atualizacaoMonetaria: atualizacaoMonetaria.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      juros: juros.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      seguro: seguro.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      taxaAdmnistrativa: taxaAdmnistrativa.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      taxaDeObra: taxaDeObra.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    };

    conteudo.push(result);
  }

  return conteudo;
}

function saldoDevedor(mes, ano) {
  const saldoDevedor = [
    {
      2021: {
        2: 0.0,
        3: 33656.99,
        4: 33656.99,
        5: 33656.99,
        6: 66692.47,
        7: 66608.15,
        8: 66608.15,
        9: 66608.15,
        10: 115120.22,
        11: 115120.22,
        12: 115120.22,
      },
      2022: {
        1: 137814.9,
        2: 137814.9,
        3: 164988.12,
        4: 164701.45,
        5: 164701.45,
        6: 164701.45,
      },
    },
  ];

  for (let index = 0; index < Object.keys(saldoDevedor[0]).length; index++) {
    const element = saldoDevedor[0];
    console.log(element[2022][1]);
    return element[ano][mes];
  }
}

async function createTable() {
  const dadosIpca = await calcular();

  $(document).ready(function () {
    var tabela = $("#tabela").DataTable({
      // language: {
      //   url: "//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
      // },
      order: [[0, "desc"]],
      lengthChange: false,
      buttons: ["copy", "excel", "pdf", "colvis"],
    });

    for (let index = 0; index < dadosIpca.length; index++) {
      const iterator = dadosIpca[index];

      const data = Object.values(iterator).slice(2, iterator.length);
      tabela.row.add(data).draw(false);
      tabela.buttons().container().appendTo("#tabela_wrapper .col-md-6:eq(0)");
    }
  });
}

createTable();
