import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes, faFont, faDiceFive, faCalendarAlt} from "@fortawesome/free-solid-svg-icons";
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import moment, {isMoment} from 'moment';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let sockClient = new SockJS('http://localhost:8080/refresheet-websocket');
let stompClient = Stomp.Client = Stomp.over(sockClient);
stompClient.debug= () => {};

const Table = ({sheet}) => {
    const data = useRef(Array.from(Array(sheet.rowNum), ()=> new Array(sheet.colNum)));
    const [dState, setDState] = useState(sheet.sheetDataList);
    const sheetColumn = useRef([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(moment());
    const myInfo = useRef({name:'', ipAddr:'', sessionId:''});
    const [myInfoState, setMyInfoState] = useState(null);
    const [editors, setEditors] = useState([]);
    const getData = async () =>{
        const res = await axios.get('https://geolocation-db.com/json/');
        myInfo.current.ipAddr = res.data.IPv4;

        let url_splt = sockClient._transport.url.split("/");
        myInfo.current.sessionId = url_splt[5];
        // 첫 접속
        stompClient.send('/app/sheet/init/'+sheet.sheetId, {}, JSON.stringify({ipAddr: myInfo.current.ipAddr, sessionId: url_splt[5]}));

    }
    const setModalIsOpenToTrue =()=>{
        setModalIsOpen(true)
    }

    const setModalIsOpenToFalse =()=>{
        setModalIsOpen(false)
    }

    const onChangeData = (e) => {
        //console.log(e.target.value);
        // 이 부분에 웹 소켓 통신 넣을 것
        let targetId = e.target.id.split('-');
        let row = parseInt(targetId[1]);
        let col = parseInt(targetId[2]);
        let val = e.target.value;
        let d = {
            sheetId: sheet.sheetId,
            rowNo: row,
            colNo: sheetColumn.current[col].colNo,
            data: val,
            editorName: myInfo.current.name
        }
        if(data.current[row][col].dataId){
            d['dataId'] = data.current[row][col].dataId;

            let dIndex = data.current[row][col].dataIndex;
            let newD = dState[data.current[row][col].dataIndex];
            if(!newD){
                newD = d;
            }
            newD['data'] = val;
            setDState([...dState.slice(0, dIndex),
                newD,
                ...dState.slice(dIndex+1)]);
            stompClient.send('/app/sheet/edit/'+sheet.sheetId, {}, JSON.stringify(d));

        }
        else{
            let stateData = dState[data.current[row][col].dataIndex];

            axios.post(`http://localhost:8080/sheet/v1.0.0/data`, d)
                .then((res)=>{
                    // update lastModified
                    setLastUpdated(moment());

                    if(res.status === 201){
                        data.current[row][col].dataId = res.data;
                        d['dataId'] = res.data;

                        sheet.sheetDataList.push(d);
                    }
                    if(!stateData){
                        data.current[row][col].dataIndex = dState.length;
                        setDState([
                            ...dState,
                            d
                        ])
                    }
                    else{
                        stateData.data = val;
                        setDState([
                            ...dState.slice(0, data.current[row][col].dataIndex),
                            d,
                            ...dState.slice(data.current[row][col].dataIndex+1)
                        ])
                    }
                    stompClient.send('/app/sheet/edit/'+sheet.sheetId, {}, JSON.stringify(d));

                })
                .catch((err)=>{
                    console.log(err);
                })
        }


    }

    useEffect(()=>{

        stompClient.connect({}, function (frame) {
            console.log('connect')
            // editor 정보 받기
            stompClient.subscribe('/topic/sheet/init/'+sheet.sheetId, (msg)=>{
                let body = JSON.parse(msg.body);
                //console.log(body);
                myInfo.current.name = body.name;
                setMyInfoState({name: body.name});
              });

            // data 변경 정보 받기
            stompClient.subscribe('/topic/sheet/edit/'+sheet.sheetId, (msg)=>{
                let body = JSON.parse(msg.body);
                //console.log(body)
                if(body.data !== data.current[body.rowNo][getColNumber(body.colNo)].value){
                    // update lastModified
                    setLastUpdated(moment());

                    let dIndex = data.current[body.rowNo][getColNumber(body.colNo)].dataIndex;
                    let d = dState[dIndex];

                    if(!d){
                        dIndex = dState.length;
                        d = {
                            sheetId: sheet.sheetId,
                            rowNo: body.rowNo,
                            colNo: body.colNo,
                            data: body.data,
                            dataId: body.dataId
                        };
                        data.current[body.rowNo][getColNumber(body.colNo)].dataIndex = dIndex;
                    }
                    console.log(d)
                    d['data']  = body.data;
                    setDState([...dState.slice(0, dIndex),
                        d,
                        ...dState.slice(dIndex+1)]);
                    console.log('change data');
                }
            })
            getData();
        });

        stompClient.onStompError = function (frame) {
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };
    }, [myInfo.current])

    const onBlurData = (e) => {
        let targetId = e.target.id.split('-');
        let row = parseInt(targetId[1]);
        let col = parseInt(targetId[2]);
        let val = e.target.value;
        let d = {
            sheetId: sheet.sheetId,
            rowNo: row,
            colNo: sheetColumn.current[col].colNo,
            data: val
        }
        if(data.current[row][col].dataId){
            d['dataId'] = data.current[row][col].dataId;
        }

        let stateData = dState[data.current[row][col].dataIndex];

        if(!sheet.sheetDataList[data.current[row][col].dataIndex]){
            axios.post(`http://localhost:8080/sheet/v1.0.0/data`, d)
                .then((res)=>{
                    // update lastModified
                    setLastUpdated(moment());

                    if(res.status === 201){
                        data.current[row][col].dataId = res.data;
                        d['dataId'] = res.data;
                        sheet.sheetDataList.push(d);
                    }
                    if(!stateData){
                        data.current[row][col].dataIndex = dState.length;
                        setDState([
                            ...dState,
                            d
                        ])
                    }
                    else{
                        stateData.data = val;
                        setDState([
                            ...dState.slice(0, data.current[row][col].dataIndex),
                            d,
                            ...dState.slice(data.current[row][col].dataIndex+1)
                        ])
                    }
                })
                .catch((err)=>{
                    console.log(err);
                })
        }
        else if(data.current[row][col].value !== sheet.sheetDataList[data.current[row][col].dataIndex].value){
            sheet.sheetDataList[data.current[row][col].dataIndex].value = val;
            axios.post(`http://localhost:8080/sheet/v1.0.0/data`, d)
                .then((res)=>{
                    // update lastModified
                    setLastUpdated(moment());
                    
                    if(res.status === 201){
                        data.current[row][col].dataId = res.data;
                        d['dataId'] = res.data;
                        sheet.sheetDataList.push(d);
                    }
                    if(!stateData){
                        data.current[row][col].dataIndex = dState.length;
                        setDState([
                            ...dState,
                            d
                        ])
                    }
                    else{
                        stateData.data = val;
                        setDState([
                            ...dState.slice(0, data.current[row][col].dataIndex),
                            d,
                            ...dState.slice(data.current[row][col].dataIndex+1)
                        ])
                    }
                })
                .catch((err)=>{
                    console.log(err);
                })
        }
        data.current[row][col].value = val;
        if(dState[data.current[row][col].dataIndex]){
            setDState([
                ...dState.slice(0, data.current[row][col].dataIndex),
                d,
                ...dState.slice(data.current[row][col].dataIndex+1)
            ])
        }else{
            data.current[row][col].dataIndex = dState.length;
            setDState([
                ...dState,
                d
            ])
        }
    }
    const onChangeCols = (e) =>{
        let id = parseInt(e.target.id.split('-')[1]);
        sheetColumn.current[id].value = e.target.value;
    }
    const onFocusCols = (e) => {
        let id = parseInt(e.target.id.split('-')[1]);
        if(sheetColumn.current[id].value !== sheet['sheetColumns'][id].colName){
            axios.put(`http://localhost:8080/sheet/v1.0.0/`+sheet.sheetId + '/col', {'colNo': sheet['sheetColumns'][id].colNo, 'colName': sheetColumn.current[id].value, 'dataType': sheet['sheetColumns'][id].dataType})
                .then((res)=>{
                    // update lastModified
                    setLastUpdated(moment());
                })
                .catch((err)=>{
                    console.log(err);
                })
        }
    }

    const [rowNum, setRowNum] = useState(sheet.rowNum);

    const CreateBody = () => {
        sheet.sheetDataList.forEach((item, index)=>{
            data.current[item.rowNo][getColNumber(item.colNo)] = {
                value: item.data,
                dataId: item.dataId,
                dataIndex: index
            }
        });

        let rows = [];

        for(let i=0;i<rowNum;i++){
            let cols = [];
            for(let j=0;j<sheet.colNum;j++){
                if(!data.current[i][j]){
                    data.current[i][j] = {
                        value: '',
                        dataId: ''
                    }
                }

                let dt = sheetColumn.current[j].dataType;
                if(dt === 'TEXT'){
                    cols.push(<td key={'td-'+i+'-'+j}>
                        <input id={'d-'+i +'-'+j} type="text" ref={data.current[i][j]} onChange={onChangeData} onBlur={onBlurData} className="form-control" style={{border:"none"}}
                               value={dState[data.current[i][j].dataIndex] ? dState[data.current[i][j].dataIndex].data : ""}/>
                    </td>);
                }
                else if(dt === 'NUMBER'){
                    cols.push(<td key={'td-'+i+'-'+j}>
                        <input id={'d-'+i +'-'+j} type="number" ref={data.current[i][j]} onChange={onChangeData} onBlur={onBlurData} className="form-control" style={{border:"none"}}
                               value={dState[data.current[i][j].dataIndex] ? dState[data.current[i][j].dataIndex].data : ""}/>
                    </td>);
                }
                else if(dt === 'DATE'){
                    cols.push(<td key={'td-'+i+'-'+j}>
                        <DatePicker
                            id={'date-'+i +'-'+j}
                            selected={dState[data.current[i][j].dataIndex] && dState[data.current[i][j].dataIndex].data ? new Date(dState[data.current[i][j].dataIndex].data) : null}
                            ref={data.current[i][j]}
                            onChange={(date, e)=>{
                                // update lastModified
                                setLastUpdated(moment());

                                if(!date){
                                    date = ""
                                }
                                let newD = {
                                    sheetId: sheet.sheetId,
                                    rowNo: i,
                                    colNo: sheetColumn.current[j].colNo,
                                    data: date
                                }
                                let d = dState[data.current[i][j].dataIndex];

                                if(data.current[i][j].dataId){
                                    newD['dataId'] = data.current[i][j].dataId;
                                }
                                if(data.current[i][j].value !== date){
                                    axios.post(`http://localhost:8080/sheet/v1.0.0/data`, newD)
                                        .then((res)=>{
                                            if(res.status === 201){
                                                data.current[i][j].dataId = res.data;
                                                newD['dataId'] = res.data;
                                                sheet.sheetDataList.push(newD);
                                            }

                                            if(!d){
                                                data.current[i][j].dataIndex = dState.length;
                                                setDState([
                                                    ...dState,
                                                    newD
                                                ])
                                            }
                                            else{
                                                d.data = date;
                                                setDState([
                                                    ...dState.slice(0, data.current[i][j].dataIndex),
                                                    newD,
                                                    ...dState.slice(data.current[i][j].dataIndex+1)
                                                ])
                                            }
                                        })
                                        .catch((err)=>{
                                            console.log(err);
                                        })
                                }
                                data.current[i][j].value = date;
                            }}
                            dateFormat={'yyyy-MM-dd'}
                        />
                    </td>);
                }

            }
            rows.push(<tr key={'tr-data-'+i} height= "30">
                {cols}
            </tr>)
        }
        return rows;
    }

    const getColNumber = (colNo) => {
        sheetColumn.current.forEach((item, index)=>{
            if(parseInt(item.colNo) === parseInt(colNo)){
                return index;
            }
        })
        return colNo-1;
    }

    const createHeader = () => {
        let headers = [];
        sheet.sheetColumns.forEach((item, i)=>{
            let dt = {
                TEXT: faFont,
                NUMBER: faDiceFive,
                DATE: faCalendarAlt};

            sheetColumn.current[sheetColumn.current.length] = {value:item.colName, colNo: item.colNo, dataType: item.dataType};

            let header = <th scope="col" key={'th-'+i}>
                    <div className="input-group">
                        <label htmlFor={'h-' + i} className="me-2">
                            <FontAwesomeIcon style={{color: "gray"}} icon={dt[item.dataType]}/>
                        </label>
                        <input id={'h-' + i} ref={sheetColumn[i]} type="text" style={{border: "none"}}
                               className="form-control" defaultValue={item.colName} onChange={onChangeCols}
                               onBlur={onFocusCols}/>
                    </div>
                 </th>;
            headers.push(
                header
            )
        });
        return headers;
    }

    const addNewColumn = (e) => {
        let data = {
            colName : e.target[0].value,
            dataType : e.target[1].value
        }
        axios.post(`http://localhost:8080/sheet/v1.0.0/`+sheet.sheetId + '/col', data)
            .catch((err)=>{
                console.log(err);
            })
    }

    const addRow = (e) => {
        data.current.push(new Array(sheet.colNum));
        setRowNum(rowNum+1);
    }


    return(
        <>

        <table className="table table-bordered">
            <thead>
                <tr key="first-tr-for-header">
                    {createHeader()}
                    <td key="last-td-for-add">
                        <div className="" onClick={setModalIsOpenToTrue} style={{color:"gray", height:"2rem", width:"2rem", textAlign:"center", lineHeight:"2rem"}}>
                            <FontAwesomeIcon style={{cursor:'pointer'}} className="me-2" icon={faPlus} />
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
            {CreateBody()}
            <tr key="last-tr-for-add">
                <td colSpan={sheet.colNum} style={{color: "gray"}}>
                    <FontAwesomeIcon onClick={addRow} style={{cursor:'pointer'}} className="me-2" icon={faPlus} /> Add Row
                </td>
            </tr>
            </tbody>
        </table>

            <Modal isOpen={modalIsOpen} style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)"
                },
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    width: '500px',
                    height: '300px',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)'
                }
            }}>
                <FontAwesomeIcon style={{cursor:'pointer'}} onClick={setModalIsOpenToFalse} className="float-end me-2" icon={faTimes} />
                <form onSubmit={addNewColumn}>
                    <div className="mb-3">
                        <label htmlFor="columnNameInput" className="form-label">Column Name</label>
                        <input type="text" className="form-control" id="columnNameInput"
                               aria-describedby="columnNameInput" name="colName" required/>
                    </div>

                    <select className="form-select" name="dataType" aria-label="Default select example" required>
                        <option selected>Data Type</option>
                        <option value="TEXT">Text</option>
                        <option value="NUMBER">Number</option>
                        <option value="DATE">Date</option>
                    </select>
                    <br/>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </Modal>
            <small>last updated: {lastUpdated.format('YYYY-MM-DD HH:mm:ss')}</small>
            <div className="float-end" style={{border: "1px solid lightgray", padding: "1rem", fontSize:"12px"}}>
                <p style={{fontSize:"15px"}}><b>Editor</b></p>
                <ul>
                    <li ref={myInfo}>{myInfo.current.name} (me)</li>
                    {editors.map(e => e)}
                </ul>
            </div>
        </>
    );
}

export default Table;