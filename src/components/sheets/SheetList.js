import useFetch from "../util/useFetch"
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import {useHistory} from "react-router-dom";
const Link = require('react-router-dom').Link;


function SheetList() {
    const{ loading, data: sheetList, error } = useFetch(
        `http://localhost:8080/sheet/v1.0.0`
    );

    const history = useHistory();
    const createSheet = () =>{
        axios.post(`http://localhost:8080/sheet/v1.0.0`, {})
        .then((res)=>{
            console.log(res.data);
            history.push("/sheet/edit/" + res.data);
        }).catch((err)=>{
            alert("Sheet를 추가할 수 없습니다..");
        })
    }
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;  

    return(
        <div>
            <button className="btn btn-primary" onClick={createSheet}>Create</button>
            <table className="table table-striped">
                <thead>
                    <tr>
                    <th scope="col">Sheet Id</th>
                    <th scope="col">Title</th>
                    <th scope="col">Last Modified</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sheetList.map((item, i) => 
                            <tr key={item.sheetId}>
                                <th scope="row">{item.sheetId}</th>
                                <td>
                                <Link to={"/sheet/edit/" + item.sheetId}>
                                    {item.sheetName}
                                </Link>
                                </td>
                                <td>{item.lastModified}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
    
}

export default SheetList;