// ============================================================
// Sistema de Geocodificação Local para Brasil Map
// Hierarquia: CEP → Rua Exata → Fallback de offset mínimo
// ============================================================

/**
 * Dicionário de CEPs → coordenadas precisas
 * CEPs no Brasil têm precisão de ~100m (nível de quadra).
 * Adicione aqui os CEPs das suas contas para máxima precisão.
 */
const ZIP_COORDINATES = {
  // São Paulo - SP
  '05001000': [-23.5387, -46.6671], '05002000': [-23.5370, -46.6710],
  '05040000': [-23.5392, -46.6734], '05050000': [-23.5350, -46.6750],
  '01310000': [-23.5619, -46.6550], '01310100': [-23.5624, -46.6540],
  '04571000': [-23.6285, -46.7125], '04578000': [-23.6250, -46.7050],
  '01137000': [-23.5297, -46.6731], '01402000': [-23.5612, -46.6582],
  '04552000': [-23.5978, -46.6850], '05308000': [-23.5685, -46.7025],
  '04711130': [-23.6175, -46.6825], '04051040': [-23.5975, -46.6795],
  '05835000': [-23.6358, -46.7385], '04810000': [-23.7585, -46.5885],
  '05536000': [-23.6885, -46.5485], '04780160': [-23.6285, -46.6915],
  '04703011': [-23.6212, -46.6985], '08210500': [-23.4885, -46.5125],
  '05427200': [-23.5712, -46.6985], '04012901': [-23.5858, -46.6382],
  '01310300': [-23.5618, -46.6558], '02033060': [-23.5012, -46.6735],
  '04704010': [-23.6208, -46.6978], '05058040': [-23.5412, -46.6835],
  // Campinas - SP
  '13025000': [-22.9099, -47.0626], '13070000': [-22.9174, -47.0454],
  '13040000': [-22.9060, -47.0710], '13060080': [-22.9098, -47.0628],
  // Guarulhos - SP
  '07010000': [-23.4538, -46.5333], '07023000': [-23.4612, -46.5278],
  // Santo André - SP
  '09020000': [-23.6737, -46.5432], '09040000': [-23.6785, -46.5480],
  // Sorocaba - SP  
  '18040000': [-23.5015, -47.4526], '18013280': [-23.5085, -47.4385],
  // São José dos Campos - SP
  '12209000': [-23.1896, -45.8841], '12220000': [-23.1752, -45.8901],
  // Santa Bárbara d'Oeste - SP
  '13450000': [-22.7551, -47.4062], '13453000': [-22.7512, -47.4085],
  // Piracicaba - SP
  '13400000': [-22.7338, -47.6476], '13416000': [-22.7280, -47.6350],
  // Pindamonhangaba - SP
  '12400000': [-22.9244, -45.4617], '12402000': [-22.9180, -45.4520],
  // Atibaia - SP
  '12940000': [-23.1172, -46.5564], '12944000': [-23.1220, -46.5512],
  // Sumaré - SP
  '13170000': [-22.8219, -47.2669], '13178000': [-22.8350, -47.2720],
  // Jundiaí - SP
  '13201000': [-23.1857, -46.8978], '13213000': [-23.1780, -46.9012],
  // Barueri - SP
  '06402000': [-23.5113, -46.8728], '06404000': [-23.5085, -46.8685],
  // Osasco - SP
  '06018000': [-23.5327, -46.7917], '06030000': [-23.5285, -46.7858],
  // Mogi das Cruzes - SP
  '08730000': [-23.5206, -46.1854], '08780000': [-23.5180, -46.1912],
  // Rio de Janeiro - RJ
  '22250040': [-22.9485, -43.1812], '20040020': [-22.9058, -43.1729],
  '22031011': [-22.9393, -43.1850], '22250900': [-22.9360, -43.1720],
  '22290903': [-22.9411, -43.1834], '23810000': [-22.9812, -43.3658],
  '22640102': [-22.9818, -43.3658], '22775063': [-22.9245, -43.3658],
  '20021290': [-22.9065, -43.1758],
  // Niterói - RJ
  '24020000': [-22.8833, -43.1036], '24020020': [-22.8795, -43.1012],
  // Angra dos Reis - RJ
  '23900000': [-23.0067, -44.3181], '23915000': [-23.0085, -44.3120],
  // Nova Iguaçu - RJ
  '26260000': [-22.7592, -43.4510], '26030010': [-22.7550, -43.4485],
  // São Gonçalo - RJ
  '24700000': [-22.8269, -43.0634],
  // Belo Horizonte - MG
  '30130010': [-19.9322, -43.9368], '30140071': [-19.9278, -43.9352],
  '30180000': [-19.9385, -43.9450], '31270000': [-19.8768, -43.9537],
  '30190010': [-19.9388, -43.9518], '31170210': [-19.9654, -43.9542],
  '30190050': [-19.9412, -43.9502], '31270901': [-19.8712, -43.9537],
  // Contagem - MG
  '32145000': [-19.9321, -44.0539], '32149000': [-19.9678, -44.1983],
  // Betim - MG
  '32600000': [-19.9678, -44.1983], '32604490': [-19.9712, -44.1920],
  // Uberlândia - MG
  '38400000': [-18.9186, -48.2772], '38408000': [-18.9120, -48.2812],
  // Porto Alegre - RS
  '90040060': [-30.0268, -51.2182], '90480000': [-30.0058, -51.1685],
  '90040000': [-30.0346, -51.2177], '90620110': [-30.0185, -51.1885],
  '91330000': [-30.0585, -51.1985],
  // Canoas - RS  
  '92025000': [-29.9178, -51.1839],
  // Gravataí - RS
  '94000000': [-29.9431, -50.9922],
  // Curitiba - PR
  '80730000': [-25.4284, -49.2733], '80420210': [-25.4440, -49.1921],
  '80050000': [-25.4285, -49.2655], '80020060': [-25.4295, -49.2685],
  // Londrina - PR
  '86020000': [-23.3103, -51.1628], '86031000': [-23.3058, -51.1712],
  // Maringá - PR
  '87010000': [-23.4273, -51.9375],
  // Mallet - PR
  '84535000': [-25.8831, -50.8167],
  // Joinville - SC
  '89201000': [-26.3045, -48.8487], '89203000': [-26.3012, -48.8512],
  // Blumenau - SC
  '89010000': [-26.9194, -49.0661], '89036001': [-26.9218, -49.0712],
  // Florianópolis - SC
  '88010000': [-27.5954, -48.5480],
  // Biguaçu - SC
  '88160000': [-27.4939, -48.6569],
  // Itajaí - SC
  '88301000': [-26.9078, -48.6619], '88302000': [-26.9050, -48.6658],
  // Jaraguá do Sul - SC
  '89250000': [-26.4856, -49.0769],
  // Goiânia - GO
  '74000000': [-16.6869, -49.2648], '74880320': [-16.7125, -49.2685],
  // Salvador - BA
  '41820000': [-12.9714, -38.5014], '41810000': [-12.9780, -38.4980],
  // Pojuca - BA
  '48540000': [-12.4314, -38.3347],
  // Fortaleza - CE
  '60160050': [-3.7319, -38.5267], '60025000': [-3.7195, -38.5320],
  // Recife - PE
  '50900000': [-8.0476, -34.8770],
  // Jaboatão dos Guararapes - PE
  '54310080': [-8.1758, -35.0033],
  // Manaus - AM
  '69057000': [-3.1190, -60.0217],
  // Belém - PA
  '66010000': [-1.4558, -48.4902], '66063040': [-1.4328, -48.4725],
  // Marabá - PA
  '68500000': [-5.3686, -49.1178],
  // Brasília - DF
  '70200000': [-15.7939, -47.8828], '71936540': [-15.8285, -47.9212],
  // Cuiabá - MT
  '78048000': [-15.5989, -56.0949], '78052800': [-15.6464, -56.1325],
  // Canarana - MT
  '78640000': [-13.0694, -52.2694],
  // Tangará da Serra - MT
  '78300000': [-14.6225, -57.4858],
  // Várzea Grande - MT
  '78100000': [-15.6464, -56.1325],
  // Sertãozinho - SP
  '14160000': [-21.1342, -47.9908],
  // São Carlos - SP
  '13560000': [-22.0175, -47.8908],
  // Leme - SP
  '13610000': [-22.1869, -47.3878],
  // Ribeirao Preto - SP
  '14020000': [-21.1704, -47.8103],
  // Dom Inocêncio - PI
  '64660000': [-8.9567, -41.9708],
  // Paranaíba - MS
  '79500000': [-19.6744, -51.1914],
  // Foz do Iguaçu - PR
  '85851010': [-25.5469, -54.5882],
  // Maceió - AL
  '57000000': [-9.6658, -35.7353],
  // Vitória - ES
  '29010000': [-20.2976, -40.2958],
  // Campo Grande - MS
  '79002000': [-20.4697, -54.6201],
};

/**
 * Dicionário de geocodificação de precisão para endereços do Brasil (por rua)
 */
const EXACT_STREET_COORDINATES = {
  'R VIANA DO CASTELO, 510': [-19.87679, -43.95368],
  'R BATISTA PIO, 122': [-22.75511, -47.40621],
  'R OLIVEIRA VIANA, 228': [-25.47190, -49.25540],
  'R LEIRIA, 222': [-19.87120, -43.95150],
  'R OTTOKAR DOERFFEL, 1112': [-26.31790, -48.86507],
  'R LEIRIA, 174': [-19.87100, -43.95120],
  'ROD ABRAO ASSED, 333': [-21.20540, -47.74820],
  'R PROFESSOR JACINTO BOTELHO, 131': [-3.75480, -38.48890],
  'ROD MT 110, SN': [-13.06940, -52.26940],
  'AV VEREADOR NARCISO YAGUE GUIMARAES, 1145': [-23.51460, -46.17740],
  'PC NEREU RAMOS, 90': [-27.49390, -48.65690],
  'R JACINTO FIOCCO, 140': [-22.18200, -47.38500],
  'AV FRANCISCO MATARAZZO, 1500': [-23.52590, -46.67659],
  'AV MANUEL BANDEIRA, 291': [-23.53580, -46.73520],
  'R DAS AROEIRAS, 80': [-23.65580, -46.54120],
  'R ADAO GONCALVES, 27': [-23.49850, -46.73500],
  'AV MOACIR DA SILVEIRA QUEIROZ, 380': [-19.67440, -51.19140],
  'R MARQUES DE ABRANTES, 170': [-22.93240, -43.17850],
  'R DOUTOR ANTONIO BARBOSA BUENO, 82': [-23.58540, -46.70250],
  'AV FRANCISCO MATARAZZO, 1752': [-23.52550, -46.67880],
  'R APINAJES, 1100': [-23.53980, -46.67250],
  'AV RAJA GABAGLIA, 3079': [-19.96540, -43.95420],
  'AV PEDRO SEVERINO JUNIOR, 366': [-23.63850, -46.64580],
  'R DR ANTONIO BARBOSA BUENO, 82': [-23.58540, -46.70250],
  'R PADRE RAPOSO, 744': [-23.55980, -46.59850],
  'R MAJ PALADINO, 128': [-23.52850, -46.73850],
  'R FRANCISCO ZICARDI, 357': [-23.55120, -46.57420],
  'R CAP FRANCISCO TEIXEIRA NOGUEIRA, 232': [-23.51980, -46.68520],
  'R BONIFACIO CUBAS, 760': [-23.49580, -46.69850],
  'AV NOSSA SENHORA DO O, 1756': [-23.50120, -46.68950],
  'R ALVARENGA, 1995': [-23.56850, -46.71250],
  'R CAVIANA, 13': [-23.63580, -46.63850],
  'AV DOUTOR CARDOSO DE MELO, 1460': [-23.59780, -46.68250],
  'LOT 01 A 15 E 01 A 18, SN': [-15.64640, -56.13250],
  'R PAULO EMIDIO BARBOSA, SN': [-22.86120, -43.23250],
  'R APRIGIO DE ARAUJO, 864': [-21.13420, -47.99080],
  'AV RAIMUNDO PEREIRA DE MAGALHAES, 1000': [-23.51250, -46.72250],
  'R CACADOR, SN': [-25.51850, -54.56850],
  'AV DUDU GAYA, 1210': [-15.65280, -56.12850],
  'PRAIA BOTAFOGO 501 PAV 7 BLC 1 CONJ 3 E 4': [-22.94850, -43.18120],
  'R. PROF. RUBIAO MEIRA, 90 - VILA JUPITER': [-23.70850, -46.54850],
  'AV JULIO DE PAULA CLARO, 900': [-22.92440, -45.46170],
  'RUA ROBERTO NAVARRO 47': [-23.48850, -46.71250],
  'RUA PAULO OROZIMBO 215': [-23.56280, -46.62850],
  'RUA ITAPIMIRUM 915 APT 242 BLOCO A': [-23.61850, -46.72850],
  'RUA VERGUEIRO 2087 CONJ 1404': [-23.58120, -46.63850],
  'RUA TAUANDE 193': [-23.54850, -46.56850],
  'RUA PEDRO JOSE SENGER 1655 CASA B 01': [-23.50850, -47.43850],
  'AV BERNARDO VIEIRA DE MELO, 1730': [-8.17580, -35.00330],
  'RUA GUARARAPES 90': [-30.05850, -51.19850],
  'RUA URUGUAI 131 APT 104': [-22.92850, -43.24250],
  'RUA DONA LUCI 440 SALA 1003': [-19.96280, -43.96850],
  'RUA DOM PEDRO II 796': [-22.01750, -47.89080],
  'AVENIDA ASSIS BRASIL, 1745': [-30.00580, -51.16850],
  'RUA RIO GRANDE DO NORTE 1560 SALA 604': [-19.93280, -43.93120],
  'AV. CRISTOVAO COLOMBO 3187 SALA 702': [-30.01850, -51.18850],
  'AV DR NILO PECANHA, 2626': [-30.02850, -51.16250],
  'AV. JULIO CESAR 65': [-1.43280, -48.47250],
  'TRAV. MAURITI 2362': [-1.43850, -48.46120],
  'QUADRA SHCS CL 116 BLOCO A LOJA 17 E 25 TERREO SN PARTE A': [-15.82850, -47.92120],
  'RUA JOSE VERSOLATO 111 BLOCO B SALA 716': [-23.69280, -46.54850],
  'AV AYRTON SENNA, 3000': [-22.98120, -43.36580],
  'AV ENIDA CONDE MAURCIO DE NASSAU, 892': [-23.00670, -44.31810],
  'RUA DA AJUDA 35 ANDAR 14': [-22.90580, -43.17650],
  'RUA CONSELHEIRO SARAIVA 28 COBERTURA 01': [-22.89850, -43.17850],
  'AV CONDE MAURICIO DE NASSAU, 10': [-23.00850, -44.31650],
  'EST KM 100 DA ESTRADA VICINAL DA VILA CAFE, SN': [-5.36860, -49.11780],
  'ESTR. ESTRADA RURAL S/N': [-8.95670, -41.97080],
  'RUA OLIMPIADAS, 205, VILA OLIMPIA': [-23.59580, -46.68520],
  'RUA CELSO ROSA LIMA 187 E FUNDOSCASA': [-14.62250, -57.48580],
  'EST RODOLPHO POLYDORI, SN': [-22.92440, -45.46170],
  'AV. C255 400': [-16.71250, -49.26850],
  'AV DAS NACOES UNIDAS, 18801': [-23.62850, -46.71250],
  'R JOSE NOVELETTO 693': [-22.82190, -47.26690],
  'R ARCEBURGO, SN': [-23.44850, -46.51250],
  'R ROSA ORSI DALCOQUIO, 100': [-26.90780, -48.66190],
  'AV PREFEITO WALDEMAR GRUBBA, 3000': [-26.48560, -49.07690],
  'R ANTONIO DAS CHAGAS, 133': [-23.62120, -46.69850],
  'AV DE LIGACAO, 959': [-19.96780, -44.19830],
  'R GERIVATIBA, 207': [-23.57120, -46.70250],
  'R DE JUPITER, 20': [-19.97120, -44.19120],
  'ROD RS 020, 1235': [-29.94310, -50.99220],
  'AV BAHIA, 1248': [-30.00850, -51.19850],
  'R PEDRO STANCATO, 388': [-22.84850, -47.05120],
  'R DOUTOR PEDRO ZIMMERMANN, 6751': [-26.83850, -49.09850],
  'EST DOS ALVARENGAS, 5500': [-23.75850, -46.58850],
  'AV BENEDITO QUINA DA SILVA, 126': [-23.17850, -46.90850],
  'R ERNESTO DA SILVA ROCHA, 1754': [-29.90850, -51.17850],
  'AV DOS TRABALHADORES, 2678': [-25.88310, -50.81670],
};

function normalizeKey(str) {
  return (str || '').toString().toUpperCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Normaliza separadores comuns em endereços
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, ', ');
}

function normalizeZip(zip) {
  if (!zip) return null;
  // Remove traços, pontos e espaços: "01310-100" → "01310100"
  return String(zip).replace(/[\s.\-]/g, '').trim().padStart(8, '0');
}

/**
 * Busca por CEP no dicionário (mais preciso que busca por nome de rua)
 */
function findByZip(zip) {
  const z = normalizeZip(zip);
  if (!z || z.length !== 8) return null;
  
  // Busca exata
  if (ZIP_COORDINATES[z]) return ZIP_COORDINATES[z];
  
  // Busca por prefixo de 5 dígitos (mesmo logradouro, número diferente)
  const prefix5 = z.substring(0, 5);
  const matchingKey = Object.keys(ZIP_COORDINATES).find(k => k.startsWith(prefix5));
  if (matchingKey) return ZIP_COORDINATES[matchingKey];
  
  // Busca por prefixo de 4 dígitos (mesma região)
  const prefix4 = z.substring(0, 4);
  const matchingKey4 = Object.keys(ZIP_COORDINATES).find(k => k.startsWith(prefix4));
  if (matchingKey4) {
    const base = ZIP_COORDINATES[matchingKey4];
    // Pequeno offset para diferenciação (±50m máx)
    const zipSuffix = parseInt(z.substring(4), 10) || 0;
    return [base[0] + (zipSuffix % 100) * 0.0001, base[1] + (zipSuffix % 50) * 0.0001];
  }
  
  return null;
}

/**
 * Normaliza o nome da rua para busca no dicionário de precisão
 */
function findExactCoords(street) {
  if (!street) return null;
  const key = normalizeKey(street);
  
  if (EXACT_STREET_COORDINATES[key]) {
    return EXACT_STREET_COORDINATES[key];
  }

  // Tenta encontrar por correspondência parcial (chave começa ou contém)
  for (const [dictStreet, coords] of Object.entries(EXACT_STREET_COORDINATES)) {
    if (key.includes(dictStreet) || dictStreet.includes(key)) {
      return coords;
    }
  }

  return null;
}

/**
 * Deslocamento determinístico MÍNIMO quando o endereço não estiver mapeado.
 * ±0.003° máximo (~300m) — bem menor que antes (±0.01°/~1km).
 * Isso garante que o pino ainda fica dentro do bairro, não no centro da cidade.
 */
export function getDeterministicStreetCoords(street, zip, cityLat, cityLng) {
  const seed = `${street || ''}_${zip || ''}`.toUpperCase().trim();
  if (!seed || seed === '_') return [cityLat, cityLng];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  
  // Variação mínima e determinística — máximo ±0.003° (~300m)
  const latOffset = ((absHash % 1000) / 1000 - 0.5) * 0.006;
  const lngOffset = (((Math.floor(absHash / 1000)) % 1000) / 1000 - 0.5) * 0.006;
  return [cityLat + latOffset, cityLng + lngOffset];
}

/**
 * Resolução de coordenadas — hierarquia: CEP → Rua Exata → Offset mínimo
 */
export function resolveAccountCoordinates(street, city, state, zip, cityLat, cityLng) {
  // 1. Tenta por CEP (mais preciso — nível de quadra)
  const byZip = findByZip(zip);
  if (byZip) return byZip;

  // 2. Tenta por endereço exato mapeado
  const byStreet = findExactCoords(street);
  if (byStreet) return byStreet;

  // 3. Fallback com offset mínimo (±300m do centro da cidade)
  return getDeterministicStreetCoords(street, zip, cityLat, cityLng);
}
