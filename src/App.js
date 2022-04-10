import React, { useState, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import './App.css';
import { fetchData } from './Utilities/fetchMovie';

import {
  makeStyles,
  CircularProgress,
} from '@material-ui/core';

const useStyles = makeStyles(()=>({
  progress: {
    color:"black",
  }
}))

function App() {
  const classes = useStyles();
  const [movie, setMovie] = useState("");
  const [message, setMessageForm] = useState([]);
  const [emojiForm, setEmojiForm] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maxMovieNo = 19;

  const onEmojiClick = (e, emojiObject) => {
    setEmojiForm([...emojiForm, emojiObject.emoji])
    setMessageForm([...message, utf2Html(emojiObject.emoji)]);
  }

  const utf2Html = (string) =>{
    return [...string].map(char => {
          const code = char.codePointAt(0);
          return code > 127 ? `&#${code};` : char;
        })
        .join("");
  }

  const newMovie = async() =>{
    const selectMovie = Math.floor(Math.random() * maxMovieNo) + 1;
    fetchData().then((data) => {
      setMovie(data.results[selectMovie].title)
    })
    .then(()=>{
      setLoading(false);
    })
    .catch(error=>console.log(error));
  }

  const submit = async() =>{
    let formdata = new FormData();
    formdata.append("movie_name", `${movie}`);
    formdata.append("emoji_array", `${message.join(" ")}`);
    const submitted = await fetch('http://127.0.0.1:5000/movies', {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    })
    .then((re)=>{
      console.log(re);
      return re;
    })
    .catch(error=>console.log(error));
    return submitted.statusText;
  }

  useEffect(() => {
    setLoading(true)
    newMovie()
    setEmojiForm([])
    setMessageForm([])
  }, [])

  const handleDelete = (e) =>{
    e.preventDefault();
    setMessageForm(prevEmojis => prevEmojis.slice(0, -1))
    setEmojiForm(pe => pe.slice(0, -1))
  }

  const handleNewMovie = (e) =>{
    e.preventDefault();
    setLoading(true)
    newMovie()
  }

  const handleReset = (e) =>{
    e.preventDefault();
    setEmojiForm([]);
    setMessageForm([]);
  }

  const handleSubmit = (e)=>{
    e.preventDefault();
    console.log(message.join(" "))
    setSubmitting(true);
    submit().then((re)=>{
      if(re === "OK"){
        alert("Form submitted")
      }
    })
    .then(()=>{
      handleNewMovie(e);
      handleReset(e);
    }).then(()=>{
      setSubmitting(false);
    });
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <div style={{color:"black"}}>
          <p style={{fontSize:"large", marginBottom:"0",  fontWeight:"bolder", textDecorationLine:"underline"}}>Movie:</p>
          <p >{loading===true?<CircularProgress className={classes.progress}/>:movie}</p>
        </div>
        <div style={{color:"black"}}>
          <p style={{fontSize:"large", marginBottom:"0",  fontWeight:"bolder", textDecorationLine:"underline"}}>Emojis You Chose:</p>
          <p style={{color:"dimgray"}}>{emojiForm.length===0?"None":emojiForm}</p>
        </div>
        <Picker onEmojiClick={onEmojiClick}></Picker>
        <div>
          <div className = "row" style={{marginTop:"0.5rem"}}>
            <form>
              <button className="btn btn-success mr-1" style={{paddingLeft:"31px", paddingRight:"30px"}} onClick={handleSubmit} disabled={loading||submitting}>Submit</button>
            </form>
            <form>
              <button className="btn btn-warning mr-1" onClick={handleReset} disabled={loading||submitting}>Reset</button>
            </form>
          </div>
          <div className = "row">
            <form>
              <button className="btn btn-danger mr-1" onClick={handleDelete} disabled={loading||submitting}>Delete</button>
            </form>
            <form>
              <button className="btn btn-primary mr-1" onClick={handleNewMovie} disabled={loading||submitting}>New Movie</button>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
