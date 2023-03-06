import {ChangeEventHandler, useEffect} from 'react'
import './App.scss'
import {ipcRenderer} from "electron";

function App() {
  useEffect(()=>{
    ipcRenderer.on('PAGE_URL_LIST'.toLowerCase(), msgHandler)
    return () => {
      ipcRenderer.off('PAGE_URL_LIST'.toLowerCase(),msgHandler)
    }
  },[])
  function msgHandler(event:any, data:any) {
    console.log(data)
  }
  function sendMsg(command:string,value:string) {
    ipcRenderer.sendSync('windows', JSON.stringify({
      command: command,
      value:value
    }));
  }
  function fileChange(e:any) {
    const file = e.target.files[0]
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(e){
      sendMsg('PAGE_URL_LIST', e?.target?.result as string)
    }
  }
  return (
    <div className="App">
      <input accept={'.json'} max={1} type="file" onChange={fileChange}/>
    </div>
  )
}

export default App
