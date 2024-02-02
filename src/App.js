import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import React, {
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';

var dateFilterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    var dateAsString = cellValue;
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split('/');
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
};

function App() {
  const gridRef = useRef();
  const [theme, setTheme] = useState(true)
  const [themeName, setThemeName] = useState("ag-theme-quartz")
  const containerStyle = useMemo(() => ({ width: '85%', height: '100%', textAlign: 'center', margin: 'auto' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([
    { field: 'athlete', filter: 'agTextColumnFilter', suppressMenu: true },
    { field: 'age', filter: 'agNumberColumnFilter', suppressMenu: true },
    { field: 'country', filter: 'agSetColumnFilter', suppressMenu: true },
    {
      field: 'year',
      maxWidth: 120,
      filter: 'agNumberColumnFilter',
      floatingFilter: false,
    },
    {
      field: 'date',
      minWidth: 215,
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      suppressMenu: true,
    },
    { field: 'sport', suppressMenu: true, filter: 'agTextColumnFilter' },
    {
      field: 'gold',
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['apply'],
      },
      suppressMenu: true,
    },
    {
      field: 'silver',
      filter: 'agNumberColumnFilter',
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    },
    {
      field: 'bronze',
      filter: 'agNumberColumnFilter',
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    },
    { field: 'total', filter: false },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: true,
      floatingFilter: true,
    };
  }, []);

  const onGridReady = useCallback((params) => {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then((resp) => resp.json())
      .then((data) => setRowData(data));
  }, []);

  const irelandAndUk = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('country', { values: ['Ireland', 'Great Britain'] })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const clearCountryFilter = useCallback(() => {
    gridRef.current.api.setColumnFilterModel('country', null).then(() => {
      gridRef.current.api.onFilterChanged();
    });
  }, []);

  const destroyCountryFilter = useCallback(() => {
    gridRef.current.api.destroyFilter('country');
  }, []);

  const endingStan = useCallback(() => {
    gridRef.current.api
      .getColumnFilterInstance('country')
      .then((countryFilterComponent) => {
        const countriesEndingWithStan = countryFilterComponent
          .getFilterKeys()
          .filter(function (value) {
            return value.indexOf('stan') === value.length - 4;
          });
        gridRef.current.api
          .setColumnFilterModel('country', { values: countriesEndingWithStan })
          .then(() => {
            gridRef.current.api.onFilterChanged();
          });
      });
  }, []);

  const printCountryModel = useCallback(() => {
    const model = gridRef.current.api.getColumnFilterModel('country');
    if (model) {
      console.log('Country model is: ' + JSON.stringify(model));
    } else {
      console.log('Country model filter is not active');
    }
  }, []);

  const sportStartsWithS = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('sport', {
        type: 'startsWith',
        filter: 's',
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const sportEndsWithG = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('sport', {
        type: 'endsWith',
        filter: 'g',
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const sportsCombined = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('sport', {
        conditions: [
          {
            type: 'endsWith',
            filter: 'g',
          },
          {
            type: 'startsWith',
            filter: 's',
          },
        ],
        operator: 'AND',
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const ageBelow25 = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('age', {
        type: 'lessThan',
        filter: 25,
        filterTo: null,
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const ageAbove30 = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('age', {
        type: 'greaterThan',
        filter: 30,
        filterTo: null,
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const ageBelow25OrAbove30 = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('age', {
        conditions: [
          {
            type: 'greaterThan',
            filter: 30,
            filterTo: null,
          },
          {
            type: 'lessThan',
            filter: 25,
            filterTo: null,
          },
        ],
        operator: 'OR',
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const ageBetween25And30 = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('age', {
        type: 'inRange',
        filter: 25,
        filterTo: 30,
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const clearAgeFilter = useCallback(() => {
    gridRef.current.api.setColumnFilterModel('age', null).then(() => {
      gridRef.current.api.onFilterChanged();
    });
  }, []);

  const after2010 = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('date', {
        type: 'greaterThan',
        dateFrom: '2010-01-01',
        dateTo: null,
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const before2012 = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('date', {
        type: 'lessThan',
        dateFrom: '2012-01-01',
        dateTo: null,
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const dateCombined = useCallback(() => {
    gridRef.current.api
      .setColumnFilterModel('date', {
        conditions: [
          {
            type: 'lessThan',
            dateFrom: '2012-01-01',
            dateTo: null,
          },
          {
            type: 'greaterThan',
            dateFrom: '2010-01-01',
            dateTo: null,
          },
        ],
        operator: 'OR',
      })
      .then(() => {
        gridRef.current.api.onFilterChanged();
      });
  }, []);

  const clearDateFilter = useCallback(() => {
    gridRef.current.api.setColumnFilterModel('date', null).then(() => {
      gridRef.current.api.onFilterChanged();
    });
  }, []);

  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  const styling = {
    background: `${theme ? 'white' : '#182230'}`,
    color: `${theme ? 'black' : 'white'}`,
    borderRadius: 5,
    padding: 5
  }

  useEffect(() => {
    console.log(themeName);
  }, [themeName])
  return (
    <div style={containerStyle}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h2>Aggrid Example</h2>

        <div style={{
          display: 'flex',
          gap: '200px',
          justifyContent: 'space-between'
        }}>
        
        <div style={{ textAlign: 'left'}}>
          <h3>Filters: </h3>
          <span className="button-group">
            <button onClick={irelandAndUk} style={styling}>Ireland &amp; UK</button>
            <button onClick={endingStan} style={styling}>Countries Ending 'stan'</button>
            <button onClick={printCountryModel} style={styling}>Print Country</button>
            <button onClick={clearCountryFilter} style={styling}>Clear Country</button>
            <button onClick={destroyCountryFilter} style={styling}>Destroy Country</button>
          </span>
          <span className="button-group">
            <button onClick={ageBelow25} style={styling}>Age Below 25</button>
            <button onClick={ageAbove30} style={styling}>Age Above 30</button>
            <button onClick={ageBelow25OrAbove30} style={styling}>
              Age Below 25 or Above 30
            </button>
            <button onClick={ageBetween25And30} style={styling}>Age Between 25 and 30</button>
            <button onClick={clearAgeFilter} style={styling}>Clear Age Filter</button>
          </span>
          <span className="button-group">
            <button onClick={after2010} style={styling}>Date after 01/01/2010</button>
            <button onClick={before2012} style={styling}>Date before 01/01/2012</button>
            <button onClick={dateCombined} style={styling}>Date combined</button>
            <button onClick={clearDateFilter} style={styling}>Clear Date Filter</button>
          </span>
          <span className="button-group">
            <button onClick={sportStartsWithS} style={styling}>Sport starts with S</button>
            <button onClick={sportEndsWithG} style={styling}>Sport ends with G</button>
            <button onClick={sportsCombined} style={styling}>
              Sport starts with S and ends with G
            </button>
          </span>
          
        </div>

          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'end', gap: 7}}>
            <span>
              <select style={styling} onChange={(e) => setThemeName(e.target.value)}>
                <option value={"ag-theme-quartz"}>ag-theme-quartz</option>
                <option value={"ag-theme-balham"}>ag-theme-balham</option>
                <option value={"ag-theme-alpine"}>ag-theme-alpine</option>
              </select>
            </span>
            <span className="">
              <button onClick={onBtnExport} style={styling}>CSV Export</button>
            </span>
            <span className="">
              <button onClick={() => {
                setTheme(!theme)
              }} style={styling}>{!theme ? 'Light' : 'Dark'} Theme</button>
            </span>
            
          </div>
        </div>

        <div style={{ flexGrow: '1', height: '550px', marginTop: 20 }}>
          <div
            style={gridStyle}
            className={
              theme ? themeName : `${themeName}-dark`
            }
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              pivotMode={false}
              sideBar={{
                toolPanels: [
                  {
                      id: 'columns',
                      labelDefault: 'Columns',
                      labelKey: 'columns',
                      iconKey: 'columns',
                      toolPanel: 'agColumnsToolPanel',
                      
                      toolPanelParams: {
                          suppressRowGroups: true,
                          suppressValues: true,
                          enablePivot: false,
                      }
                  },
                  {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                  }
              ]
            }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
