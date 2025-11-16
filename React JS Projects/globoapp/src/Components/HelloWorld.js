import React from "react";

const Helloworld = () => {
    // return(
    //     <div>
    //         <h1>Hello world</h1>
    //     </div>
    // )

    return React.createElement(
        'div', 
        {id: 'hello', className: 'dummyClass'}, 
        React.createElement('h1' , null, 'Hello world'))
}

export default Helloworld