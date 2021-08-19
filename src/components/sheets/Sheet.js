import React, {useRef} from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from "./Table"
import useFetch from "../util/useFetch"

import axios from "axios";

const Link = require('react-router-dom').Link;

function Sheet({match}) {
    const sheetName = useRef({value: ''});

    const{ loading, data: sheet, error } = useFetch(
        `http://localhost:8080/sheet/v1.0.0/` + match.params.sheetId
    );

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;

    sheetName.current.value = sheet['sheetName'];


    const onChangeName = (e) =>{
        sheetName.current.value = e.target.value;
    }
    const onFocusName = (e) => {
        if(sheetName.current.value !== sheet['sheetName']){

            axios.put(`http://localhost:8080/sheet/v1.0.0/`+match.params.sheetId, {'sheetName': sheetName.current.value})
                .catch((err)=>{
                    console.log(err);
                })
            sheet['sheetName'] = sheetName.current.value;
        }
    }

    return (
        <div>
            <hr/>
            <input ref={sheetName} type="text" className="form-control" style={{height:"3rem", border:"none", fontSize:"2rem"}} defaultValue={sheet['sheetName']} onChange={onChangeName} onBlur ={onFocusName}/>
            <small>
                Sheet Id: {match.params.sheetId}
            </small>
            <Table sheet={sheet} />

        </div>
    )
}

export default Sheet;