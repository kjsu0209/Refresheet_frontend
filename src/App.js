import './App.css';
import React from 'react';
import SheetList from './components/sheets/SheetList'
import Sheet from './components/sheets/Sheet'
import CreateSheet from './components/sheets/CreateSheet'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';



const App = () => { 
  return ( 
    <Router>
      <div className="container"> 
        <h1>Refresheet</h1> 
        <Route exact path='/sheet' component={SheetList}/>
        <Route exact path='/sheet/create' component={CreateSheet}/>
        <Route exact path='/sheet/edit/:sheetId' component={Sheet}/>
      </div>
    </Router> 
  ); 
}


export default App;
