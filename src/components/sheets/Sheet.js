import React from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from "./Table"
import useFetch from "../util/useFetch"
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Link = require('react-router-dom').Link;

function Sheet({match}) {
    
    const{ loading, data: sheet, error } = useFetch(
        `http://localhost:8080/sheet/v1.0.0/` + match.params.sheetId
    );
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;  

    return (
        <div>
            <small>
                Sheet Id: {match.params.sheetId}
            </small>
            <Table sheet={sheet} />
            <div className="position-fixed end-0 top-50" style={{backgroundColor:"lightgray", borderRadius:"50%", color:"gray", height:"2rem", width:"2rem", textAlign:"center", lineHeight:"2rem"}}>
                <FontAwesomeIcon style={{cursor:'pointer'}} className="me-2" icon={faPlus} />
            </div>
        </div>
    )
}

export default Sheet;