import React from 'react';
import * as XLSX from 'xlsx';

function toTitleCase(str) {
  if (!str) return str;

  const lowerWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) =>
      i > 0 && lowerWords.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

function normalize(str) {
  return (str || '')
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getField(row, aliases) {
  const keys = Object.keys(row);

  for (const alias of aliases) {
    const found = keys.find(
      k => normalize(k) === normalize(alias)
    );

    if (
      found &&
      row[found] !== undefined &&
      row[found] !== null &&
      row[found] !== ''
    ) {
      return row[found];
    }
  }

  return '';
}

const BRAZIL_CITIES = {
  'SAO PAULO': {
    lat: -23.5505,
    lng: -46.6333,
    state: 'SP'
  },
  'RIO DE JANEIRO': {
    lat: -22.9068,
    lng: -43.1729,
    state: 'RJ'
  },
  'CURITIBA': {
    lat: -25.4284,
    lng: -49.2733,
    state: 'PR'
  },
  'BLUMENAU': {
    lat: -26.9194,
    lng: -49.0661,
    state: 'SC'
  },
  'BELO HORIZONTE': {
    lat: -19.9167,
    lng: -43.9345,
    state: 'MG'
  },
  'PORTO ALEGRE': {
    lat: -30.0346,
    lng: -51.2177,
    state: 'RS'
  },
  'GOIANIA': {
    lat: -16.6869,
    lng: -49.2648,
    state: 'GO'
  },
  'SALVADOR': {
    lat: -12.9714,
    lng: -38.5014,
    state: 'BA'
  },
  'FORTALEZA': {
    lat: -3.7319,
    lng: -38.5267,
    state: 'CE'
  },
  'BRASILIA': {
    lat: -15.7939,
    lng: -47.8828,
    state: 'DF'
  },
  'RECIFE': {
    lat: -8.0476,
    lng: -34.8770,
    state: 'PE'
  },
  'BELEM': {
    lat: -1.4558,
    lng: -48.4902,
    state: 'PA'
  },
  'MANAUS': {
    lat: -3.119,
    lng: -60.0217,
    state: 'AM'
  },
  'NATAL': {
    lat: -5.7945,
    lng: -35.211,
    state: 'RN'
  },
  'PIRACICABA': {
    lat: -22.7338,
    lng: -47.6476,
    state: 'SP'
  },
  'PINHAIS': {
    lat: -25.444,
    lng: -49.1921,
    state: 'PR'
  }
};

export default function UploadScreen({
  onDataLoaded,
  onTriggerMock,
  CATEGORIES
}) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;

        const workbook = XLSX.read(bstr, {
          type: 'binary'
        });

        const sheetName = workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet);

        let geocodedCount = 0;
        let droppedCount = 0;

        const parsed = json
          .map((row, idx) => {
            const name =
              getField(row, ['Person Full Name']) ||
              'Sem Nome';

            const email =
              getField(row, ['Person Work Email']);

            const id =
              getField(row, ['SESA Number']) ||
              `ID-${idx}`;

            const manager =
              getField(row, ['Manager Full Name']);

            const rawCity =
              getField(row, ['City of Work']);

            const vendedoresRaw =
              getField(row, ['Vendedores']);

            const cityKey = normalize(rawCity);

            const cityMatch =
              BRAZIL_CITIES[cityKey];

            let coordinates = null;
            let resolvedState = null;
            let geocoded = false;

            if (cityMatch) {
              coordinates = [
                cityMatch.lat,
                cityMatch.lng
              ];

              resolvedState =
                cityMatch.state;

              geocoded = true;
              geocodedCount++;
            } else {
              droppedCount++;
            }

            let categoria = 'Sem Categoria';
            let categoria_foco = null;

            if (vendedoresRaw) {
              const parts =
                vendedoresRaw.split(' - ');

              categoria =
                parts[0]?.trim() ||
                'Sem Categoria';

              categoria_foco =
                parts[1]?.trim() ||
                null;
            }

            const catObj =
              CATEGORIES.find(
                c =>
                  normalize(c.acronym) ===
                  normalize(categoria)
              ) || {
                acronym: categoria,
                color: '#888888'
              };

            return {
              id,
              nNumber: id,

              name,
              email,

              managerName: manager,

              city: rawCity
                ? toTitleCase(rawCity)
                : 'Não Mapeada',

              state: resolvedState,

              coordinates,

              category: catObj,
              subcategory: categoria_foco,

              geocoded
            };
          })
          .filter(
            person =>
              person.coordinates !== null
          );

        onDataLoaded(parsed);

        alert(
          `Importação concluída.\n\n` +
          `Geocodificados: ${geocodedCount}\n` +
          `Descartados: ${droppedCount}`
        );
      } catch (err) {
        alert(
          'Erro ao ler o arquivo Excel. Verifique o formato das colunas.'
        );

        console.error(err);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#f1f5f9',
        fontFamily: 'sans-serif',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow:
            '0 10px 25px rgba(0,0,0,0.05)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            color: '#1e293b',
            marginBottom: '8px',
            fontWeight: '700'
          }}
        >
          Brasil Map
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '30px'
          }}
        >
          Carregue a base de dados para
          visualização geográfica
        </p>

        <label
          style={{
            display: 'block',
            background: '#00A950',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          Selecionar Arquivo Excel (.xlsx)

          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>

        <div
          style={{
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              height: '1px',
              background: '#cbd5e1',
              flex: 1
            }}
          />

          <span
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              textTransform: 'uppercase'
            }}
          >
            ou
          </span>

          <div
            style={{
              height: '1px',
              background: '#cbd5e1',
              flex: 1
            }}
          />
        </div>

        <button
          onClick={onTriggerMock}
          style={{
            width: '100%',
            background: '#3b82f6',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '8px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Ativar Gerador de Testes
        </button>
      </div>
    </div>
  );
}
