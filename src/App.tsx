import { useState } from 'react';
import './App.css';

function App() {
  const [color, setColor] = useState('black');

  const onClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tab.id! },
      args: [color],
      func: (color) => {
        document.body.style.backgroundColor = color;
      },
    });
  };

  return <></>;
}

export default App;
