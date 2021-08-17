import useFetch from "../util/useFetch"
import 'bootstrap/dist/css/bootstrap.min.css';
const Link = require('react-router-dom').Link;


function SheetList() {
    const{ loading, data: sheetList, error } = useFetch(
        `http://localhost:8080/sheet/v1.0.0`
    );
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;  

    return(
        <div>
            <Link to="/sheet/create">
                <button className="btn btn-primary">Create</button>
            </Link>
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