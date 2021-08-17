import React from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function submitForm(){

    // form에 있는 모든 내용 parse해서 post로 보내기

    // 페이지 이동
    
}

function CreateSheet() {
    return (
        <form className="form">
            <h3>Create Sheet
                <button className="btn btn-primary ms-3" onClick={submitForm()}>Create</button>
            </h3>
            <hr/>
            <div className="row g-3 align-items-center mb-3">
                <div className="col-auto">
                    <label htmlFor="sheetName" className="col-form-label">Sheet Name</label>
                </div>
                <div className="col-auto">
                    <input type="text" id="sheetName" className="form-control" aria-describedby="sheetNameInline"/>
                </div>
                <div className="col-auto">
                    <span id="sheetNameInline" className="form-text">
                        Must be 8-20 characters long.
                    </span>
                </div>
            </div>
            <CreateSheetColumn/>

        </form>
    )
}

class CreateSheetColumn extends React.Component{
    constructor(){
        super();

        this.state = {
            children: [
                <CreateSheetColumnInput no="1" key="1"/>,
            ],
            count: 2
        }

        this.addCol = this.addCol.bind(this);

    }

    addCol(e){
        e.preventDefault();
        
        this.state.children[this.state.count] = <CreateSheetColumnInput no={this.state.count} key={this.state.count}/>;
        this.setState({count: this.state.count + 1});
    }

    render(){

        return(
            <div>
                {this.state.children.map(child => child)}
                <button className="btn btn-primary m-3" onClick={this.addCol}>Add Column...</button>
            </div>
        )
    }
}

class CreateSheetColumnInput extends React.Component{

    render(){
        let id_val = 'col-' + this.props.no;
        return(
            <div className="card p-3 mb-2" id={id_val}>
            <div className="row g-3 align-items-center">
                <div className="col-auto">
                    <h4>Column {this.props.no}</h4>  
                    <input type="hidden" name="col" value={this.props.no}/>

                </div>
                <div className="col-auto position-absolute end-0">
                    <FontAwesomeIcon style={{cursor:'pointer'}} className="me-4" icon={faTrash} />
                </div>
            </div>
            <hr/>
            <div className="row g-3 align-items-center mb-2">
                <div className="col-auto">
                    <label htmlFor="sheetName" className="col-form-label">Column Name</label>
                </div>
                <div className="col-auto">
                    <input type="text" id="sheetName" className="form-control" aria-describedby="sheetNameInline"/>
                </div>
                <div className="col-auto">
                    <span id="sheetNameInline" className="form-text">
                        Must be 8-20 characters long.
                    </span>
                </div>
            
                <div className="col-auto">
                    <label htmlFor="sheetName" className="col-form-label">Data Type</label>
                </div>
                <div className="col-auto">
                    <select className="form-select" id="inputGroupSelect01">
                        <option defaultValue="TEXT">Text</option>
                        <option value="NUMBER">Number</option>
                        <option value="DATE">Date</option>
                    </select>
                  </div>
                <div className="col-auto">
                    <span id="sheetNameInline" className="form-text">
                    </span>
                </div>
            </div>
        </div>
        )
    }
}

export default CreateSheet;