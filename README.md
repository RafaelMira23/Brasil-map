# Brasil Map — Visualizador Geográfico de Pessoas e Contas

**Brasil Map** é uma aplicação web interativa em React e Leaflet desenvolvida para mapear, visualizar e analisar geograficamente os **Responsáveis (Pessoas)** e suas **Contas Comerciais** em todo o território nacional.

---

## 🚀 Funcionalidades Principais

### 1. 👥 Múltiplas Categorias sem Hierarquia
- Suporte nativo a responsáveis pertencentes a mais de uma categoria (ex: `IA`, `SERVICES`, `EAE - IA`).
- Cada categoria tem o mesmo peso e prioridade. A pessoa é contabilizada e exibida em cada bolha/lista referente às categorias que possui.
- No perfil do responsável, todas as categorias são exibidas em badges coloridos sem distinção de "categoria principal".

### 2. 🗺️ Modos de Visualização no Mapa ("Pessoas" vs "Contas")
- **Mapa de Pessoas:** Agrupa responsáveis em clusters por estado (zoom nacional) e por cidade (zoom regional), identificados pela cor determinística da categoria.
- **Mapa de Contas:** Exibe marcadores das contas comerciais posicionados no mapa. Ao clicar em uma conta, abre-se o painel com o **Resumo da Conta** e o **Responsável pela Conta** logo abaixo.

### 3. 📍 Geolocalização Exata por Endereço para Contas
- As contas são posicionadas no mapa através do seu endereço exato (Rua, Número, CEP, Cidade e Estado) via geocodificação automática com cache local.
- Os responsáveis continuam agrupados pela cidade de trabalho.

### 4. 🇧🇷 Exibição Global no Mapa ao Filtrar
- Ao aplicar qualquer filtro (por estado, cidade, segmento ou categoria), os pontos correspondentes são exibidos ao longo de todo o mapa do Brasil, e não apenas restritos ao estado selecionado.

### 5. 🔍 Filtros Avançados e Regras de Negócio
- **Filtro de Job Code 'S' (Specialization Code):** Por padrão, são exibidas apenas pessoas cujo `Specialization Code` inicia com a letra **'S'** (ex: `SUEP`, `SSSP`, `SCOP`, `SUSP`). Há uma opção no painel de filtros para incluir pessoas com outros códigos.
- **Contas sem Responsável:** Contas que não possuem `Account Owner` (ou responsável em branco) são ignoradas e descartadas na importação.
- **Apenas pessoas com contas:** Filtro para isolar apenas os responsáveis que possuem ao menos 1 conta vinculada.
- **Apenas pessoas com categoria:** Filtro para ocultar pessoas sem categoria associada.
- **Exibição de Contas ao Clicar no Responsável:** Ao selecionar um responsável, se ele possuir contas, os marcadores de suas contas são destacados e posicionados no mapa.

### 6. 🎨 Legenda Dinâmica de Categorias
- Exibida no canto inferior do mapa, apresentando a lista de todas as categorias ativas no conjunto de dados, suas cores correspondentes e a contagem de registros. Permite alternar o filtro ao clicar nas categorias.

---

## 📑 Estrutura das Planilhas de Importação

A aplicação aceita planilhas no formato `.xlsx` ou `.xls` através da tela inicial de carregamento:

### 1. Planilha de Pessoas (Responsáveis)
- `Person Full Name`: Nome completo do responsável.
- `Person Work Email`: E-mail corporativo.
- `SESA Number`: Código identificador / registro.
- `Manager Full Name`: Nome do gestor direto.
- `City of Work`: Cidade onde atua no Brasil.
- `Categoria` / `De quê?`: Categorias do responsável (separadas por hífen `-`).
- `Specialization Code`: Código da especialização / Job Code (ex: `SUEP`, `SSSP`, `SCOP`).

### 2. Planilha de Contas
- `Account Name`: Nome da empresa / conta cliente.
- `Account Owner`: Nome do responsável pela conta (deve corresponder ao nome na planilha de pessoas).
- `Market Segment`: Segmento de mercado.
- `Market Sub-Segment`: Sub-segmento.
- `State/Province`: Estado (UF).
- `City`: Cidade.
- `Street`: Endereço da rua com número.
- `Zip Code` / `Zip/Postal Code`: CEP.
- `Classification Level 1` e `Classification Level 2`: Níveis de classificação.
- `Total PAM (converted)` e `Total Sales`: Valores comerciais.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **Vite**
- **Leaflet** & **React-Leaflet**
- **XLSX (SheetJS)** para processamento de planilhas Excel
- **OpenStreetMap & CartoDB Tile Layers**

---

## 💻 Como Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador no endereço exibido no terminal (normalmente `http://localhost:5173`).

4. Carregue as planilhas de **Pessoas** e **Contas** na tela inicial para acessar a visualização no mapa.
