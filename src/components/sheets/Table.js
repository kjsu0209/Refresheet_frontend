import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes, faFont, faDiceFive, faCalendarAlt} from "@fortawesome/free-solid-svg-icons";
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import moment, {isMoment} from 'moment';

const Table = ({sheet}) => {
    const data = useRef(Array.from(Array(sheet.rowNum), ()=> new Array(sheet.colNum)));
    const sheetColumn = useRef([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const setModalIsOpenToTrue =()=>{
        setModalIsOpen(true)
    }

    const setModalIsOpenToFalse =()=>{
        setModalIsOpen(false)
    }

    const onChangeData = (e) => {
        //console.log(e.target.value);
        // 이 부분에 웹 소켓 통신 넣을 것

    }

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
        if(data.current[row][col].value !== val){
            axios.post(`http://localhost:8080/sheet/v1.0.0/data`, d)
                .catch((err)=>{
                    console.log(err);
                })
        }
    }
    console.log(sheet)
    const onChangeCols = (e) =>{
        let id = parseInt(e.target.id.split('-')[1]);
        sheetColumn.current[id].value = e.target.value;
    }
    const onFocusCols = (e) => {
        let id = parseInt(e.target.id.split('-')[1]);
        if(sheetColumn.current[id].value !== sheet['sheetColumns'][id].colName){
            axios.put(`http://localhost:8080/sheet/v1.0.0/`+sheet.sheetId + '/col', {'colNo': sheet['sheetColumns'][id].colNo, 'colName': sheetColumn.current[id].value, 'dataType': sheet['sheetColumns'][id].dataType})
                .catch((err)=>{
                    console.log(err);
                })
        }
    }

    const [rowNum, setRowNum] = useState(sheet.rowNum);

    const CreateBody = () => {
        let rows = [];

        sheet.sheetDataList.forEach((item, index)=>{
            data.current[item.rowNo][getColNumber(item.colNo)] = {
                value: item.data,
                dataId: item.dataId
            }
        });
        console.log(data.current);


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
                    cols.push(<td>
                        <input id={'d-'+i +'-'+j} type="text" ref={data.current[i][j]} onChange={onChangeData} onBlur={onBlurData} className="form-control" style={{border:"none"}} defaultValue={data.current[i][j].value}/>
                    </td>);
                }
                else if(dt === 'NUMBER'){
                    cols.push(<td>
                        <input id={'d-'+i +'-'+j} type="number" ref={data.current[i][j]} onChange={onChangeData} onBlur={onBlurData} className="form-control" style={{border:"none"}} defaultValue={data.current[i][j].value}/>
                    </td>);
                }
                else if(dt === 'DATE'){
                    cols.push(<td>
                        <input id={'d-'+i +'-'+j} type="text" ref={data.current[i][j]} onFocus={
                            (e) => {

                            }
                        } onChange={onChangeData} onBlur={onBlurData} className="form-control" style={{border:"none"}} defaultValue={data.current[i][j].value}/>
                        <DatePicker
                            id={'date-'+i +'-'+j}
                            selected={moment(data.current[i][j].value).toDate()}
                            valueDefault={moment.isDate(data.current[i][j].value) ? data.current[i][j].value: null}
                            ref={data.current[i][j]}
                            onChange={(date, e)=>{
                                let bDate = moment(data.current[i][j].value, 'YYYY-MM-DD', true);
                                data.current[i][j].value = date;
                                e.target.selected = bDate.toDate();
                            }}
                            onBlur={onBlurData}
                            dateFormat={'yyyy-MM-dd'}
                        />
                    </td>);
                }

            }
            rows.push(<tr height= "30">
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

            let header = <th scope="col">
                    <div className="input-group">
                        <label htmlFor={'h-' + i} className="me-2">
                            <FontAwesomeIcon style={{color: "gray"}} icon={dt[item.dataType]}/>
                        </label>
                        <input id={'h-' + i} ref={sheetColumn[i]} type="text" style={{border: "none"}}
                               className="form-control" defaultValue={item.colName} onChange={onChangeCols}
                               onBlur={onFocusCols}/>
                    </div>
                 </th>;
            sheetColumn.current.push({value:item.colName, colNo: item.colNo, dataType: item.dataType});
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
                <tr>
                    {createHeader()}
                    <td>
                        <div className="" onClick={setModalIsOpenToTrue} style={{color:"gray", height:"2rem", width:"2rem", textAlign:"center", lineHeight:"2rem"}}>
                            <FontAwesomeIcon style={{cursor:'pointer'}} className="me-2" icon={faPlus} />
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
            {CreateBody()}
            <tr>
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
        </>
    );
}

export default Table;