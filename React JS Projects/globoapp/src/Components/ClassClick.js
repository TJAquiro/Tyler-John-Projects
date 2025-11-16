import React, { Component } from 'react'

class ClassClick extends Component {

    clickHandeler() {
        console.log('Click the button')
    }
  
  
    render() {
    return (
      <div>
        <button onClick={this.clickHandeler}>Click Me</button>
      </div>
    )
  }
}

export default ClassClick