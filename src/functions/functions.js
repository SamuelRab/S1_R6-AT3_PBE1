

const functions = {
  calculoEntrega: async (dados) => {
   
    const vDistancia = dados.distancia * dados.valor_da_base_por_km;
    const vPeso = dados.peso_de_carga * dados.valor_da_base_por_kg;
    let base = vDistancia + vPeso;

    let acrescimo = 0;
    let desconto = 0;
    let taxa = 0;

    
    if (dados.tipo_de_entrega.toLowerCase() === "urgente") {
      acrescimo = base * 0.2;
    }

    
    let parcial = base + acrescimo;
    if (parcial > 500.0) {
      desconto = parcial * 0.1;
    }

    
    if (dados.peso_de_carga > 50) {
      taxa = 15.0;
    }

    const final = parseFloat((parcial - desconto + taxa).toFixed(2));

    
    const calculos = {
      distancia: vDistancia,
      peso: vPeso,
      acrescimo,
      desconto,
      taxa,
      final,
    };
    return calculos;
  },
};

module.exports = { functions };
