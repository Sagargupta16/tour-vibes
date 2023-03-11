import React from 'react'
import classes from './journal.module.css'
import Card from '../components/UI/card'

const myjournal = (props) => {
    const title = props.title;
    const data = props.data;
  return (
    <div className={classes.myjournal_main}>
        <h1>{title}</h1>
        <input type="text" placeholder="Search" className={classes.myjournal_search}/>
        <div className={classes.myjournal_cards}>
            {data.map((item, index) => {
                return (
                  <a href="/blog">
                    <Card key={index} data={item} />
                  </a>
                );
            })}
        </div>
    </div>
  )
}

export default myjournal
