import './App.css';
import { useEffect, useState } from 'react';
import { ConfigProvider, theme, Form, Input, Table, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const { Option } = Select;
const style = {marginBottom: 30, padding: 15, marginTop:20}
const weekFormat = 'DD/MM';
// const weekFormatCustom = 'DDMM'; // FORMATEO EXCEL PRUEBAS
const weekFormatCustom = 'DD/MM';
const customWeekStartEndFormat = (value) =>
`${dayjs(value).startOf('week').format(weekFormat)} - ${dayjs(value)
  .endOf('week')
  .format(weekFormat)}`;

const rangos = ['Jefe', 'Sub Jefe','Comisario', 'Sub Comisario', 'Inspector', 'SubInspector', 'Teniente',
                'Sub Teniente', 'Sargento Mayor', 'Sargento 1°', 'Sargento', 'Cabo 1°', 'Cabo', 'Agente ', 'Cadete'];

const rangos2 = [{value: 'jefe', label: 'Jefe'}, {value: 'subJefe', label: 'Sub Jefe'}, {value: 'comisario', label: 'Comisario'}]
              
function App() {
  const url = 'https://docs.google.com/spreadsheets/d/'
  //const ssid = '1qa5K_uMH43mqqnbPuYqLLpCf3rNO3dGtFD-tnl_F9qo' // EXCEL PRUEBAS
  const ssid = '12DMuQWCvsQjE3LZhYn2Ldo6YCp0eBFSVc-fuEdBQokE'
  const query1 = `/gviz/tq?sheet=`
  
  let endpoint = `${url}${ssid}${query1}`;
  
  const [form] = Form.useForm();
  const [columns, setColumns] = useState();
  const [data, setData] = useState();
  const [dataFilter, setDataFilter] = useState(); 
  const [loading, setLoading] = useState(true); 
  
  const getData = async (semana) => {
      if(semana != undefined)
        endpoint += semana
      await fetch (endpoint)
      .then(res => res.text())
      .then(data => {
        const temp = data.substr(47).slice(0, -2);
        const json = JSON.parse(temp);
        console.log(json)
        const cols = [];
        const rows = [];
        json.table.cols.shift();
        cols.push(({title: 'Rango', dataIndex: 'A', key: 'A'})) // COLUMNA DE RANGO
        json.table.cols.map((c) => cols.push({title: c.label, dataIndex: c.id, key: c.id}));
        let ids = 0
        json.table.rows.map((r) => {
          if(r.c[0] != null) {
            rows.push({
            key: ids,
            A: r.c[0].v, // Rango
            B: r.c[1] === null ? "" : r.c[1].v, // Nombre
            C: r.c[2] === null ? "" : r.c[2].f, // Lunes
            D: r.c[3] === null ? "" : r.c[3].f, // Martes
            E: r.c[4] === null ? "" : r.c[4].f, // Miercoles
            F: r.c[5] === null ? "" : r.c[5].f, // Jueves
            G: r.c[6] === null ? "" : r.c[6].f, // Viernes
            H: r.c[7] === null ? "" : r.c[7].f, // Sabado
            I: r.c[8] === null ? "" : r.c[8].f, // Domingo
            J: r.c[9] === null ? "" : r.c[9].f, // Total
            K: r.c[10] === null ? "" : r.c[10].v, // Discord ID
            L: r.c[11] === null ? "" : r.c[11].v, // Ausencias
            })
            ids++;
          }
        })
        setColumns(cols.slice(0,12))
        setData(rows)
        setDataFilter(rows)
        setLoading(false)
        })
    } 
  
  useEffect(() => {
    getData()
  }, []);

  const filterDiscordID = (did) => {
    did = did.trim()
    const result = data.filter((d) => d.K == did)
    if (did == "")
      setDataFilter(data)
    else if(result.length > 0)
      setDataFilter(result)
    else
      setDataFilter(data)
  } 

  const filterNombre = (nombre) => {
    nombre = nombre.trim().toLowerCase()
    const result = data.filter((d) => d.B.toLowerCase().includes(nombre))
    if (nombre == "")
      setDataFilter(data)
    else if(result.length > 0)
      setDataFilter(result)
    else
      setDataFilter(data)
  }

  const semana = (semana) => {
    const namePage = `Semana ${dayjs(semana)
      .endOf('week').add(1, 'day')
      .format(weekFormatCustom)}`;
    getData(namePage)
  }

  return (
    <ConfigProvider     
      theme={{
        algorithm: theme.darkAlgorithm,
      }}>
    <div className="App">
      <Form form={form} layout="inline">
        <Form.Item
          style={style}
          label="Semana">
          <DatePicker defaultValue={dayjs()} format={customWeekStartEndFormat} onChange={(e) => semana(e)} picker="week" />
        </Form.Item>
        <Form.Item
          style={style}
          label="Nombre">
          <Input onChange={(e) => filterNombre(e.target.value)}/>
        </Form.Item>
        <Form.Item
          style={style}
          label="Discord ID">
          <Input onChange={(e) => filterDiscordID(e.target.value)}/>
        </Form.Item>
        {/* <Form.Item
          style={{marginBottom: 30, padding: 15, marginTop:20, width: 250, alignContent: 'start' }}
          label="Rango"
          size="large">
            <Select 
              options={rangos2}
            >
            
          </Select>
        </Form.Item> */}
      </Form>
      <Table 
        loading={loading}
        style={{padding: 10}}
        bordered={true}
        pagination={false}
        columns={columns}
        dataSource={dataFilter}
        scroll={{
          y: 625
        }}
        footer={() => 'Notificar si algún dato se encuentra desactualizado'}
        >
      </Table>
    </div>
    </ConfigProvider>
  );
}

export default App;
