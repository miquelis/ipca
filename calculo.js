function BuscarDados() {
  return new Promise(function (resolve, reject) {
    const settings = {
      async: true,
      crossDomain: true,
      url: "https://apisidra.ibge.gov.br/values/t/1737/n1/1/v/63/p/202012-202112/d/2?formato=json",
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
  } else {
    mes = dataIPCA.getMonth() + 3;
  }

  ano = dataIPCA.getFullYear();

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

  console.log(conteudo);
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
        7: 66692.47,
        8: 66692.47,
        9: 66692.47,
        10: 66692.47,
        11: 66692.47,
        12: 66692.47,
      },
    },
  ];

  for (const iterator of saldoDevedor) {
    return iterator[ano][mes];
  }
}

async function createTable() {
  const dadosIpca = await calcular();

  $(document).ready(function () {
    var tabela = $("#tabela").DataTable({
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
      },
    });

    for (const iterator of dadosIpca) {
      const data = Object.values(iterator).slice(2, iterator.length);
      console.log(data);
      tabela.row.add(data).draw(false);
    }
  });
}

createTable();