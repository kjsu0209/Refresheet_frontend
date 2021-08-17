import React from "react";

class Table extends React.Component{

    constructor(props){
        super();

        this.sheet = props.sheet;
        this.table = [];
        this.dataRowEnd = 100;
        
        for(let i=0;i<this.dataRowEnd;i++){
            this.table.push(new Array(this.sheet.sheetColumns.length))
        }

        for(let i=0;i<this.sheet.sheetColumns.length;i++){
            for(let j=0;j<this.dataRowEnd;j++){
                this.table[j][i] = {
                    rowNo: j,
                    colNo: i,
                    value: "",
                    id: ""
                }
            }
        }

        for(let i=0;i<props.sheet.sheetDataList.length;i++){
            let d = this.sheet.sheetDataList[i];

            this.table[d.rowNo-1][d.colNo-1].value = d.data;
            this.table[d.rowNo-1][d.colNo-1].id = d.dataId;
        }

    }
    
    render(){
        return(
            <table className="table table-bordered">
                <thead>
                    <tr>
                    {
                        this.sheet.sheetColumns.map((item, i)=>
                            <ColumnHeader sheetId={this.sheet.sheetId} key={"colH" + i} data={item} />
                        )
                    }
                   
                    </tr>
                </thead>
                <tbody>
                    {
                        this.table.map((item, i)=>
                            <Row sheetId={this.sheet.sheetId} key={"row"+i} row={item} />
                        )
                    }
                </tbody>
            </table>
        )
    }
}

class ColumnHeader extends React.Component{
    render(){
        return(
            <th scope="col">
                {this.props.data.colName}
            </th>
        )
    }
}

class Row extends React.Component{

    render(){
        return(
            <tr height= "30">
                {
                    this.props.row.map((item, i)=>
                        <ColumnData sheetId={this.props.sheetId}  key={"col-"+ i + "-" + item.id} data={item} />
                    )
                }
            </tr>
        )
    }
}

class ColumnData extends React.Component{

    constructor(props){
        super();
        this.onChange = this.onChange.bind(this);
    }

    onChange(e){

        // this.props.value랑 비교 후 변한 부분 업데이트
        console.log(e.target.id + "-" +e.target.value)
        this.setState({})
    }

    render(){
        return(
            <td>
                <input type="text" id={"d-"+this.props.data.rowNo+"-"+this.props.data.colNo} onChange={this.onChange} className="form-control" style={{border:"none"}} value={this.props.data.value} />
            </td>
        )
    }
}


export default Table;