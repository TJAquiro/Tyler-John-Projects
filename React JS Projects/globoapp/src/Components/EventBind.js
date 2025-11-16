import React, { Component } from 'react'

class EventBind extends Component {
  
    constructor(props) {
        super(props)

        this.state = {
            message: 'Hello'
        }

        this.clickHandler = this.clickHandler.bind(this)
    }

    clickHandler() {
        if(this.state.message == 'Hello'){
            this.setState({
            message: 'Goodbye'
            })
            console.log(this.state.message)
        }
        else{
            this.setState({
            message: 'Hello'
            })
            console.log(this.state.message)
        }
    }
  
    render() {
    return (
      <div>
        {/* <button onClick={this.clickHandler.bind(this)}>Click</button> */}

        {/* <button onClick={() => this.clickHandler()}>{this.state.message}</button> */}

        <button onClick={this.clickHandler}>{this.state.message}</button>
      </div>
    )
  }
}

export default EventBind